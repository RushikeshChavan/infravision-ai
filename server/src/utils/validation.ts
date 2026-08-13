import { Types } from "mongoose";

export function isValidObjectId(id: any): boolean {
  if (!id) return false;
  return (typeof id === "string" || id instanceof Types.ObjectId) && Types.ObjectId.isValid(id.toString());
}

export function toObjectId(id: string): Types.ObjectId {
  return new Types.ObjectId(id);
}

export function validateRequiredString(val: any, fieldName: string): string | null {
  if (val === undefined || val === null || (typeof val === "string" && val.trim() === "")) {
    return `${fieldName} is required and must be a non-empty string`;
  }
  return null;
}

export function validateNumericRange(val: any, min: number, max: number, fieldName: string): string | null {
  const num = typeof val === "number" ? val : parseFloat(val);
  if (isNaN(num) || num < min || num > max) {
    return `${fieldName} must be a number between ${min} and ${max}`;
  }
  return null;
}

export function validateLatitude(val: any): string | null {
  if (val === undefined || val === null) return null;
  return validateNumericRange(val, -90, 90, "Latitude");
}

export function validateLongitude(val: any): string | null {
  if (val === undefined || val === null) return null;
  return validateNumericRange(val, -180, 180, "Longitude");
}

export function validateCompletionPercentage(val: any): string | null {
  if (val === undefined || val === null) return null;
  const num = typeof val === "number" ? val : parseInt(val, 10);
  if (isNaN(num) || num < 0 || num > 100) {
    return "Completion percentage must be an integer between 0 and 100";
  }
  return null;
}

export function validateNonNegativeNumber(val: any, fieldName: string): string | null {
  if (val === undefined || val === null) return null;
  const num = typeof val === "number" ? val : parseFloat(val);
  if (isNaN(num) || num < 0) {
    return `${fieldName} must be a non-negative number`;
  }
  return null;
}

export function validateDateOrdering(startDateVal: any, endDateVal: any, startFieldName: string, endFieldName: string): string | null {
  if (!startDateVal || !endDateVal) return null;
  const start = new Date(startDateVal);
  const end = new Date(endDateVal);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return "Invalid date format";
  }
  if (end < start) {
    return `${endFieldName} must be on or after ${startFieldName}`;
  }
  return null;
}
