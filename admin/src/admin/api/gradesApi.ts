import { apiRequest } from "./client";
import type { ApiResponse } from "../auth/authTypes";
import type { CreateGradeRequest, Grade, UpdateGradeRequest } from "../types";

interface GradeApiResponse {
  id: string;
  name: string;
  description?: string | null;
  active: boolean;
  createdBy?: string | null;
  lastModifiedBy?: string | null;
  createdAt: string;
  updatedAt: string;
  monthlyFee?: number | string | null;
  currencyCode?: string | null;
}

function mapGradeResponse(grade: GradeApiResponse): Grade {
  return {
    id: grade.id,
    name: grade.name,
    description: grade.description || undefined,
    active: grade.active,
    createdBy: grade.createdBy || undefined,
    lastModifiedBy: grade.lastModifiedBy || undefined,
    createdAt: grade.createdAt,
    updatedAt: grade.updatedAt,
    monthlyFee: grade.monthlyFee === null ? undefined : Number(grade.monthlyFee ?? 0),
    currencyCode: grade.currencyCode || "LKR",
  };
}

export async function fetchGrades(): Promise<Grade[]> {
  const response = await apiRequest<ApiResponse<GradeApiResponse[]>>("/api/v1/course/grades");
  return response.data.map(mapGradeResponse);
}

export async function createGrade(request: CreateGradeRequest): Promise<Grade> {
  const response = await apiRequest<ApiResponse<GradeApiResponse>>("/api/v1/course/grades", {
    method: "POST",
    body: {
      name: request.name,
      description: request.description,
      monthlyFee: request.monthlyFee,
      currencyCode: request.currencyCode,
    },
  });
  return mapGradeResponse(response.data);
}

export async function updateGrade(gradeId: string, request: UpdateGradeRequest): Promise<Grade> {
  const response = await apiRequest<ApiResponse<GradeApiResponse>>(
    `/api/v1/course/grades/${gradeId}`,
    {
      method: "PUT",
      body: {
        name: request.name,
        description: request.description,
        monthlyFee: request.monthlyFee,
        currencyCode: request.currencyCode,
      },
    },
  );
  return mapGradeResponse(response.data);
}

export async function deleteGrade(gradeId: string): Promise<void> {
  await apiRequest<ApiResponse<unknown>>(`/api/v1/course/grades/${gradeId}`, {
    method: "DELETE",
  });
}
