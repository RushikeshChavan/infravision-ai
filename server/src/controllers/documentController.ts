import { Request, Response } from "express";
import DocumentModel, {
  DOCUMENT_CLASSIFICATIONS,
  DOCUMENT_TYPES,
  DocumentClassification,
} from "../models/document";
import ProjectModel from "../models/project";
import { USER_ROLES } from "../types/auth";
import { isValidObjectId } from "../utils/validation";

export async function createDocument(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const {
    project,
    documentType,
    fileName,
    fileUrl,
    classification,
    description,
  } = req.body;

  if (!project || !documentType || !fileName || !fileUrl) {
    return res.status(400).json({
      error: "Project, document type, file name, and file URL are required",
    });
  }

  if (!isValidObjectId(project)) {
    return res.status(400).json({ error: "Invalid project ObjectId" });
  }

  const projectExists = await ProjectModel.findById(project);
  if (!projectExists) {
    return res.status(404).json({ error: "Project not found" });
  }

  if (!DOCUMENT_TYPES.includes(documentType)) {
    return res.status(400).json({ error: "Invalid document type" });
  }

  if (
    classification &&
    !DOCUMENT_CLASSIFICATIONS.includes(classification as DocumentClassification)
  ) {
    return res.status(400).json({ error: "Invalid document classification" });
  }

  try {
    const document = new DocumentModel({
      project,
      uploadedBy: req.user.id,
      documentType,
      fileName,
      fileUrl,
      classification: classification || "INTERNAL",
      description,
      uploadedAt: new Date(),
    });

    await document.save();

    res.status(201).json({
      message: "Document created successfully",
      document,
    });
  } catch (error) {
    console.error("Error creating document:", error);
    res.status(500).json({ error: "Failed to create document" });
  }
}

export async function getDocumentsByProject(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { projectId } = req.params;

  if (!isValidObjectId(projectId)) {
    return res.status(400).json({ error: "Invalid project ID" });
  }

  const projectExists = await ProjectModel.findById(projectId);
  if (!projectExists) {
    return res.status(404).json({ error: "Project not found" });
  }

  try {
    const query: any = { project: projectId };

    // Enforce classification read access based on user role
    if (req.user.role === USER_ROLES.CITIZEN) {
      query.classification = "PUBLIC";
    } else if (req.user.role === USER_ROLES.CONTRACTOR) {
      query.classification = { $in: ["PUBLIC", "INTERNAL"] };
    }

    const documents = await DocumentModel.find(query).populate(
      "uploadedBy",
      "id name email role",
    );

    res.json({ documents });
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
}

export async function getDocumentById(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid document ID" });
  }

  try {
    const document = await DocumentModel.findById(id).populate(
      "uploadedBy",
      "id name email role",
    );

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Enforce classification read access based on user role
    if (
      req.user.role === USER_ROLES.CITIZEN &&
      document.classification !== "PUBLIC"
    ) {
      return res
        .status(403)
        .json({ error: "Insufficient permissions to access this document" });
    }

    if (
      req.user.role === USER_ROLES.CONTRACTOR &&
      (document.classification === "RESTRICTED" ||
        document.classification === "CONFIDENTIAL")
    ) {
      return res
        .status(403)
        .json({ error: "Insufficient permissions to access this document" });
    }

    res.json({ document });
  } catch (error) {
    console.error("Error fetching document:", error);
    res.status(500).json({ error: "Failed to fetch document" });
  }
}

export async function deleteDocument(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid document ID" });
  }

  try {
    const document = await DocumentModel.findByIdAndDelete(id);

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    res.json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({ error: "Failed to delete document" });
  }
}
