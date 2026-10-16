
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const MAX_BODY_SIZE = 10_000;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const districts = [
    "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo",
    "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara",
    "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar",
    "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya",
    "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya",
];


const juniorSubjects = [
    "Maths",
    "Science",
    "English",
    "Sinhala",
    "Tamil",
];

const seniorSubjects = [
    ...juniorSubjects,
    "Business Studies",
    "History",
];

const alSubjects = [
    "Combined Maths",
    "Biology",
    "Chemistry",
    "Physics",
    "Business Studies",
    "Economics",
];


function json(message, status) {
    return NextResponse.json({ message }, { status });
}

function cleanText(value) {
    return value.normalize("NFC").replace(/\r/g, "").trim();
}

export async function POST(request) {
    try {
        const origin = request.headers.get("origin");
        const host = request.headers.get("host");

        if (!origin || !host) return json("Invalid request.", 403);

        let originUrl;
        try {
            originUrl = new URL(origin);
        } catch {
            return json("Invalid request.", 403);
        }

        if (originUrl.host !== host) return json("Invalid request.", 403);

        const contentType = request.headers.get("content-type") || "";
        if (!contentType.toLowerCase().includes("application/json")) {
            return json("Unsupported request format.", 415);
        }

        const contentLength = Number(request.headers.get("content-length") || 0);
        if (contentLength > MAX_BODY_SIZE) {
            return json("Request is too large.", 413);
        }

        const rawBody = await request.text();
        if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_SIZE) {
            return json("Request is too large.", 413);
        }

        let body;
        try {
            body = JSON.parse(rawBody);
        } catch {
            return json("Invalid request data.", 400);
        }

        if (!body || typeof body !== "object" || Array.isArray(body)) {
            return json("Invalid request data.", 400);
        }

        const allowedFields = [
            "name", "email", "phone", "role", "district", "city",
            "classFormat", "grade", "subjects", "contactMethod",
            "consent", "website",
        ];

        if (Object.keys(body).some((key) => !allowedFields.includes(key))) {
            return json("Invalid form data.", 400);
        }

        if (
            typeof body.website !== "string" ||
            typeof body.consent !== "boolean"
        ) {
            return json("Invalid form data.", 400);
        }

        if (body.website.trim() !== "") {
            return json("Your registration has been received.", 200);
        }

        if (body.consent !== true) {
            return json("Please provide consent before registering.", 400);
        }

        const requiredFields = [
            "name", "email", "phone", "role", "district",
            "classFormat", "grade", "contactMethod",
        ];

        for (const field of requiredFields) {
            if (typeof body[field] !== "string" || !body[field].trim()) {
                return json("Please complete all required fields.", 400);
            }
        }

        if (
            typeof body.city !== "string" ||
            !Array.isArray(body.subjects) ||
            body.subjects.length === 0 ||
            body.subjects.length > 20 ||
            body.subjects.some((subject) => typeof subject !== "string")
        ) {
            return json("Please check your city and subject selections.", 400);
        }

        const name = cleanText(body.name);
        const email = cleanText(body.email);
        const phone = cleanText(body.phone);
        const city = cleanText(body.city);
        const role = body.role;
        const district = body.district;
        const classFormat = body.classFormat;
        const grade = body.grade;
        const contactMethod = body.contactMethod;

        if (
            name.length > 100 ||
            email.length > 254 ||
            phone.length > 25 ||
            city.length > 100
        ) {
            return json("One or more fields are too long.", 400);
        }

        if (/[\u0000-\u001F\u007F]/.test(name)) {
            return json("Please check your name and try again.", 400);
        }

        if (!emailRegex.test(email) || email.includes("..")) {
            return json("Please provide a valid email address.", 400);
        }

        if (!/^[+()\d\s.-]{7,25}$/.test(phone)) {
            return json("Please provide a valid phone number.", 400);
        }

        if (!["student", "parent"].includes(role)) {
            return json("Please select who is registering.", 400);
        }

        if (!districts.includes(district)) {
            return json("Please select a valid Sri Lankan district.", 400);
        }

        if (!["online", "onsite", "either"].includes(classFormat)) {
            return json("Please select a valid class format.", 400);
        }

        const isAL = grade === "al";
        const validGrades = [...Array.from({ length: 11 }, (_, i) => String(i + 1)), "al"];

        if (!validGrades.includes(grade)) {
            return json("Please select a valid grade.", 400);
        }

        if (!["whatsapp", "phone", "email"].includes(contactMethod)) {
            return json("Please select a valid contact method.", 400);
        }


        const gradeNumber = Number(grade);

        const validSubjects = isAL
            ? alSubjects
            : gradeNumber >= 10
                ? seniorSubjects
                : juniorSubjects;

        const subjects = [...new Set(body.subjects)];

        if (
            subjects.some((subject) => !validSubjects.includes(subject))
        ) {
            return json("One or more selected subjects are invalid for this grade.", 400);
        }

        const requiredEnv = [
            "RESEND_API_KEY",
            "CONTACT_EMAIL",
            "EMAIL_FROM",
            "UPSTASH_REDIS_REST_URL",
            "UPSTASH_REDIS_REST_TOKEN",
        ];

        if (requiredEnv.some((key) => !process.env[key])) {
            console.error("Pre-registration service configuration is incomplete.");
            return json("The registration service is not configured.", 503);
        }

        const redis = Redis.fromEnv();
        const rateLimit = new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(5, "10 m"),
            prefix: "mentify:preregister",
        });

        const ip = request.headers.get("x-real-ip") || "unknown";
        const limit = await rateLimit.limit(ip);

        if (!limit.success) {
            return json("Too many registration attempts. Please try again later.", 429);
        }

        const emailBody = [
            "New Mentify class pre-registration",
            "",
            `Name: ${name}`,
            `Email: ${email}`,
            `Phone: ${phone}`,
            `Registering as: ${role}`,
            `District: ${district}`,
            `City/Town: ${city || "Not provided"}`,
            `Preferred class format: ${classFormat}`,
            `Grade: ${isAL ? "Advanced Level (A/L)" : `Grade ${grade}`}`,
            `Preferred subjects: ${subjects.join(", ")}`,
            `Preferred contact method: ${contactMethod}`,
            "",
            "Privacy consent: Confirmed on submission",
            "",
            "Note: This is a pre-registration enquiry. Enrolment is subject to approval before payment.",
        ].join("\n");

        const resend = new Resend(process.env.RESEND_API_KEY);
        const { error } = await resend.emails.send({
            from: process.env.EMAIL_FROM,
            to: [process.env.CONTACT_EMAIL],
            replyTo: email,
            subject: "New Mentify class pre-registration",
            text: emailBody,
        });

        if (error) {
            console.error("Pre-registration email delivery failed.");
            return json(
                "We could not submit your registration. Please try again later.",
                502,
            );
        }

        return json("Your pre-registration has been submitted successfully.", 200);
    } catch {
        console.error("Pre-registration request failed.");
        return json("The registration service is temporarily unavailable.", 500);
    }
}
