import { Request, Response } from "express";
import MilestoneModel, { MILESTONE_STATUS } from "../models/milestone";
import ProjectModel from "../models/project";
import { isValidObjectId } from "../utils/validation";

export async function createMilestone(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const {
    project,
    name,
    description,
    plannedDate,
    actualDate,
    completionPercentage,
    status,
  } = req.body;

  if (!project || !name) {
    return res.status(400).json({ error: "Project and name are required" });
  }

  if (!isValidObjectId(project)) {
    return res.status(400).json({ error: "Invalid project ObjectId" });
  }

  // Verify project exists
  const projectExists = await ProjectModel.findById(project);
  if (!projectExists) {
    return res.status(404).json({ error: "Project not found" });
  }

  if (completionPercentage !== undefined) {
    const percent = parseInt(completionPercentage);
    if (isNaN(percent) || percent < 0 || percent > 100) {
      return res
        .status(400)
        .json({ error: "Completion percentage must be between 0 and 100" });
    }
  }

  if (status && !MILESTONE_STATUS.includes(status)) {
    return res.status(400).json({ error: "Invalid milestone status" });
  }

  try {
    const milestone = new MilestoneModel({
      project,
      name,
      description,
      plannedDate,
      actualDate,
      completionPercentage: completionPercentage || 0,
      status: status || "Pending",
      verifiedBy: null,
      verificationDate: null,
    });

    await milestone.save();

    res.status(201).json({
      message: "Milestone created successfully",
      milestone,
    });
  } catch (error) {
    console.error("Error creating milestone:", error);
    res.status(500).json({ error: "Failed to create milestone" });
  }
}

export async function getMilestonesByProject(req: Request, res: Response) {
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
    const milestones = await MilestoneModel.find({
      project: projectId,
    }).populate("verifiedBy", "id name email");

    res.json({ milestones });
  } catch (error) {
    console.error("Error fetching milestones:", error);
    res.status(500).json({ error: "Failed to fetch milestones" });
  }
}

export async function getMilestoneById(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid milestone ID" });
  }

  try {
    const milestone = await MilestoneModel.findById(id).populate(
      "verifiedBy",
      "id name email",
    );

    if (!milestone) {
      return res.status(404).json({ error: "Milestone not found" });
    }

    res.json({ milestone });
  } catch (error) {
    console.error("Error fetching milestone:", error);
    res.status(500).json({ error: "Failed to fetch milestone" });
  }
}

export async function updateMilestone(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { id } = req.params;
  const updateData = req.body;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid milestone ID" });
  }

  // Prevent changing project reference
  if (updateData.project) {
    return res.status(400).json({ error: "Cannot modify project reference" });
  }

  if (updateData.completionPercentage !== undefined) {
    const percent = parseInt(updateData.completionPercentage);
    if (isNaN(percent) || percent < 0 || percent > 100) {
      return res
        .status(400)
        .json({ error: "Completion percentage must be between 0 and 100" });
    }
  }

  if (updateData.status && !MILESTONE_STATUS.includes(updateData.status)) {
    return res.status(400).json({ error: "Invalid milestone status" });
  }

  // Don't allow clients to arbitrarily set verifiedBy or verificationDate
  if (updateData.verifiedBy || updateData.verificationDate) {
    return res.status(400).json({
      error: "Cannot directly modify verification information",
    });
  }

  try {
    const milestone = await MilestoneModel.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("verifiedBy", "id name email");

    if (!milestone) {
      return res.status(404).json({ error: "Milestone not found" });
    }

    res.json({
      message: "Milestone updated successfully",
      milestone,
    });
  } catch (error) {
    console.error("Error updating milestone:", error);
    res.status(500).json({ error: "Failed to update milestone" });
  }
}

export async function deleteMilestone(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid milestone ID" });
  }

  try {
    const milestone = await MilestoneModel.findByIdAndDelete(id);

    if (!milestone) {
      return res.status(404).json({ error: "Milestone not found" });
    }

    res.json({ message: "Milestone deleted successfully" });
  } catch (error) {
    console.error("Error deleting milestone:", error);
    res.status(500).json({ error: "Failed to delete milestone" });
  }
}
