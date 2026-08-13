import { Request, Response } from "express";
import InspectionModel, { INSPECTION_STATUS } from "../models/inspection";
import ProjectModel from "../models/project";
import { isValidObjectId } from "../utils/validation";

export async function createInspection(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const {
    project,
    inspectionDate,
    latitude,
    longitude,
    remarks,
    status,
    completionPercentage,
  } = req.body;

  if (!project || !inspectionDate) {
    return res.status(400).json({
      error: "Project and inspection date are required",
    });
  }

  if (!isValidObjectId(project)) {
    return res.status(400).json({ error: "Invalid project ObjectId" });
  }

  const projectExists = await ProjectModel.findById(project);
  if (!projectExists) {
    return res.status(404).json({ error: "Project not found" });
  }

  if (latitude !== undefined) {
    const lat = parseFloat(latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      return res.status(400).json({ error: "Invalid latitude" });
    }
  }

  if (longitude !== undefined) {
    const lon = parseFloat(longitude);
    if (isNaN(lon) || lon < -180 || lon > 180) {
      return res.status(400).json({ error: "Invalid longitude" });
    }
  }

  if (completionPercentage !== undefined) {
    const percent = parseInt(completionPercentage);
    if (isNaN(percent) || percent < 0 || percent > 100) {
      return res
        .status(400)
        .json({ error: "Completion percentage must be between 0 and 100" });
    }
  }

  if (status && !INSPECTION_STATUS.includes(status)) {
    return res.status(400).json({ error: "Invalid inspection status" });
  }

  // Do not allow clients to set verified directly
  if (req.body.verified) {
    return res.status(400).json({
      error: "Cannot set verified status during creation",
    });
  }

  try {
    const inspection = new InspectionModel({
      project,
      inspector: req.user.id,
      inspectionDate,
      latitude: latitude !== undefined ? parseFloat(latitude) : undefined,
      longitude: longitude !== undefined ? parseFloat(longitude) : undefined,
      remarks,
      status: status || "Scheduled",
      completionPercentage: completionPercentage
        ? parseInt(completionPercentage)
        : 0,
      verified: false,
    });

    await inspection.save();

    res.status(201).json({
      message: "Inspection created successfully",
      inspection,
    });
  } catch (error) {
    console.error("Error creating inspection:", error);
    res.status(500).json({ error: "Failed to create inspection" });
  }
}

export async function getInspectionsByProject(req: Request, res: Response) {
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
    const inspections = await InspectionModel.find({
      project: projectId,
    }).populate("inspector", "id name email role");

    res.json({ inspections });
  } catch (error) {
    console.error("Error fetching inspections:", error);
    res.status(500).json({ error: "Failed to fetch inspections" });
  }
}

export async function getInspectionById(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid inspection ID" });
  }

  try {
    const inspection = await InspectionModel.findById(id).populate(
      "inspector",
      "id name email role",
    );

    if (!inspection) {
      return res.status(404).json({ error: "Inspection not found" });
    }

    res.json({ inspection });
  } catch (error) {
    console.error("Error fetching inspection:", error);
    res.status(500).json({ error: "Failed to fetch inspection" });
  }
}

export async function updateInspection(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { id } = req.params;
  const updateData = req.body;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid inspection ID" });
  }

  // Prevent changing project or inspector
  if (updateData.project || updateData.inspector) {
    return res.status(400).json({
      error: "Cannot modify project or inspector",
    });
  }

  // Prevent clients from setting verified directly
  if (updateData.verified) {
    return res.status(400).json({
      error: "Cannot modify verified status directly",
    });
  }

  if (updateData.latitude !== undefined) {
    const lat = parseFloat(updateData.latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      return res.status(400).json({ error: "Invalid latitude" });
    }
  }

  if (updateData.longitude !== undefined) {
    const lon = parseFloat(updateData.longitude);
    if (isNaN(lon) || lon < -180 || lon > 180) {
      return res.status(400).json({ error: "Invalid longitude" });
    }
  }

  if (updateData.completionPercentage !== undefined) {
    const percent = parseInt(updateData.completionPercentage);
    if (isNaN(percent) || percent < 0 || percent > 100) {
      return res
        .status(400)
        .json({ error: "Completion percentage must be between 0 and 100" });
    }
  }

  if (updateData.status && !INSPECTION_STATUS.includes(updateData.status)) {
    return res.status(400).json({ error: "Invalid inspection status" });
  }

  try {
    const inspection = await InspectionModel.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("inspector", "id name email role");

    if (!inspection) {
      return res.status(404).json({ error: "Inspection not found" });
    }

    res.json({
      message: "Inspection updated successfully",
      inspection,
    });
  } catch (error) {
    console.error("Error updating inspection:", error);
    res.status(500).json({ error: "Failed to update inspection" });
  }
}
