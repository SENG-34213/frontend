export type MaterialStatus = "ACTIVE" | "PROCESSING" | "FAILED" | "ARCHIVED" | string;

export type Material = {
  id: string;
  title: string;
  description?: string;
  type?: string;
  purpose?: string;
  status?: MaterialStatus;
  courseId?: string;
  moduleId?: string;
  lessonId?: string;
  assignmentId?: string;
  fileName?: string;
  fileSize?: number;
  contentType?: string;
  createdAt?: string;
  uploadedAt?: string;
  updatedAt?: string;
};

export type MaterialListResponse =
  | Material[]
  | { content?: Material[]; items?: Material[]; data?: Material[]; totalElements?: number };

export type MaterialUploadDraft = {
  title: string;
  description?: string;
  type?: string;
  purpose?: string;
  courseId?: string;
  moduleId?: string;
  lessonId?: string;
  assignmentId?: string;
};

export type MaterialDownloadResponse = { downloadUrl?: string; url?: string; expiresAt?: string };

export type MaterialApi = {
  list: (filters?: {
    courseId?: string;
    moduleId?: string;
    lessonId?: string;
    assignmentId?: string;
    type?: string;
    status?: string;
    search?: string;
    page?: number;
    size?: number;
  }) => Promise<MaterialListResponse>;
  upload: (
    file: File,
    draft: MaterialUploadDraft,
    onProgress?: (progress: number) => void,
  ) => Promise<Material>;
  download: (materialId: string) => Promise<MaterialDownloadResponse>;
  update: (materialId: string, patch: Partial<MaterialUploadDraft>) => Promise<Material>;
  archive: (materialId: string) => Promise<Material>;
  remove: (materialId: string) => Promise<void>;
  attach: (
    materialId: string,
    target: { courseId?: string; moduleId?: string; lessonId?: string; assignmentId?: string },
  ) => Promise<Material>;
};
