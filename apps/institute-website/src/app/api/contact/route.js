
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const MAX_BODY_SIZE = 10_000;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(message, status) {
    return NextResponse.json({ message }, { status });
}

function cleanText(value) {
    return value.normalize("NFC").replace(/\r/g, "").trim();
}

function getClientIp(request) {
    // Prefer the client IP header set by your hosting platform.
    return request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request) {
    try {
        // Reject cross-origin submissions.
        const origin = request.headers.get("origin");
        const host = request.headers.get("host");

        if (!origin || !host) {
            return json("Invalid request.", 403);
        }

        let originUrl;

        try {
            originUrl = new URL(origin);
        } catch {
            return json("Invalid request.", 403);
        }

        if (originUrl.host !== host) {
            return json("Invalid request.", 403);
        }

        // Accept JSON only.
        const contentType = request.headers.get("content-type") || "";

        if (!contentType.toLowerCase().includes("application/json")) {
            return json("Unsupported request format.", 415);
        }

        const contentLength = Number(
            request.headers.get("content-length") || 0
        );

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

        if (
            !body ||
            typeof body !== "object" ||
            Array.isArray(body)
        ) {
            return json("Invalid request data.", 400);
        }

        const allowedFields = [
            "name",
            "email",
            "subject",
            "message",
            "website",
        ];

        if (
            Object.keys(body).some(
                (key) => !allowedFields.includes(key)
            )
        ) {
            return json("Invalid form data.", 400);
        }

        // Honeypot field: bots may fill this hidden field.
        if (
            typeof body.website !== "string"
        ) {
            return json("Invalid form data.", 400);
        }

        if (body.website.trim() !== "") {
            // Return a neutral response without sending an email.
            return json("Your message has been received.", 200);
        }

        for (const field of ["name", "email", "subject", "message"]) {
            if (
                typeof body[field] !== "string" ||
                body[field].trim() === ""
            ) {
                return json("Please complete all required fields.", 400);
            }
        }

        const name = cleanText(body.name);
        const email = cleanText(body.email);
        const subject = cleanText(body.subject);
        const message = cleanText(body.message);

        if (
            name.length > 100 ||
            email.length > 254 ||
            subject.length > 150 ||
            message.length > 5000
        ) {
            return json("One or more fields are too long.", 400);
        }

        if (
            /[\u0000-\u001F\u007F]/.test(name) ||
            /[\u0000-\u001F\u007F]/.test(subject) ||
            /[\u0000-\u001F\u007F]/.test(message)
        ) {
            return json(
                "Please remove unsupported control characters.",
                400
            );
        }

        if (
            !emailRegex.test(email) ||
            email.includes("..")
        ) {
            return json("Please provide a valid email address.", 400);
        }

        // Check configuration before initializing services.
        const requiredEnv = [
            "RESEND_API_KEY",
            "CONTACT_EMAIL",
            "EMAIL_FROM",
            "UPSTASH_REDIS_REST_URL",
            "UPSTASH_REDIS_REST_TOKEN",
        ];

        if (requiredEnv.some((key) => !process.env[key])) {
            console.error("Contact service configuration is incomplete.");
            return json("The contact service is not configured.", 503);
        }

        // Rate-limit each IP to 5 submissions per 10 minutes.
        const redis = Redis.fromEnv();

        const rateLimit = new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(5, "10 m"),
            prefix: "mentify:contact",
        });

        const limit = await rateLimit.limit(getClientIp(request));

        if (!limit.success) {
            return json(
                "Too many messages. Please try again later.",
                429
            );
        }

        // Send plain text rather than user-controlled HTML.
        const emailBody = [
            "New message from the Mentify contact form",
            "",
            `Name: ${name}`,
            `Email: ${email}`,
            `Subject: ${subject}`,
            "",
            "Message:",
            message,
        ].join("\n");

        const resend = new Resend(process.env.RESEND_API_KEY);

        const { error } = await resend.emails.send({
            from: process.env.EMAIL_FROM,
            to: [process.env.CONTACT_EMAIL],
            replyTo: email,
            subject: "New Mentify contact form message",
            text: emailBody,
        });

        if (error) {
            console.error("Contact email delivery failed.");
            return json(
                "We could not send your message. Please try again later.",
                502
            );
        }

        return json("Your message has been sent successfully.", 200);
    } catch {
        // Avoid logging submitted personal information.
        console.error("Contact form request failed.");
        return json(
            "The contact service is temporarily unavailable.",
            500
        );
    }
}
