import assert from "node:assert/strict";
import test from "node:test";
import { getAssignmentEditPolicy } from "./assignmentEditPolicy.mjs";

test("draft assignments allow full edits", () => {
  assert.deepEqual(getAssignmentEditPolicy("DRAFT", 0), {
    canEditMetadata: true,
    canEditSubmissionSettings: true,
    canManageAttachments: true,
  });
});

test("published assignments without submissions allow full edits", () => {
  assert.deepEqual(getAssignmentEditPolicy("PUBLISHED", 0), {
    canEditMetadata: true,
    canEditSubmissionSettings: true,
    canManageAttachments: true,
  });
});

test("published assignments with submissions allow metadata edits only", () => {
  assert.deepEqual(getAssignmentEditPolicy("PUBLISHED", 2), {
    canEditMetadata: true,
    canEditSubmissionSettings: false,
    canManageAttachments: false,
  });
});

test("closed assignments are preview-only", () => {
  assert.deepEqual(getAssignmentEditPolicy("CLOSED", 0), {
    canEditMetadata: false,
    canEditSubmissionSettings: false,
    canManageAttachments: false,
  });
});
