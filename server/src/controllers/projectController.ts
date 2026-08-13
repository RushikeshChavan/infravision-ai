import { Request, Response } from "express";
import ProjectModel, { PROJECT_STATUSES } from "../models/project";
import { isValidObjectId } from "../utils/validation";

export async function createProject(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const {
    name,
    description,
    projectCode,
    department,
    location,
    latitude,
    longitude,
    plannedStartDate,
    plannedEndDate,
    actualStartDate,
    actualEndDate,
    totalBudget,
    status,
    projectManager,
    contractor,
  } = req.body;

  if (!name || !projectCode || !department || !projectManager) {
    return res.status(400).json({
      error: "Name, projectCode, department, and projectManager are required",
    });
  }

  if (!isValidObjectId(projectManager)) {
    return res.status(400).json({ error: "Invalid projectManager ObjectId" });
  }

  if (contractor && !isValidObjectId(contractor)) {
    return res.status(400).json({ error: "Invalid contractor ObjectId" });
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

  if (totalBudget !== undefined) {
    const budget = parseFloat(totalBudget);
    if (isNaN(budget) || budget < 0) {
      return res.status(400).json({ error: "Budget must be non-negative" });
    }
  }

  if (status && !PROJECT_STATUSES.includes(status)) {
    return res.status(400).json({ error: "Invalid project status" });
  }

  try {
    const project = new ProjectModel({
      name,
      description,
      projectCode: projectCode.toUpperCase(),
      department,
      location,
      latitude: latitude !== undefined ? parseFloat(latitude) : undefined,
      longitude: longitude !== undefined ? parseFloat(longitude) : undefined,
      plannedStartDate,
      plannedEndDate,
      actualStartDate,
      actualEndDate,
      totalBudget: totalBudget ? parseFloat(totalBudget) : undefined,
      status: status || "Planned",
      projectManager,
      contractor: contractor || null,
      createdBy: req.user.id,
    });

    await project.save();

    res.status(201).json({
      message: "Project created successfully",
      project,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json({ error: "Project code already exists" });
    }

    console.error("Error creating project:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
}

export async function getProjects(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const projects = await ProjectModel.find().populate(
      "projectManager contractor createdBy",
      "id name email role",
    );

    res.json({ projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
}

export async function getProjectById(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid project ID" });
  }

  try {
    const project = await ProjectModel.findById(id).populate(
      "projectManager contractor createdBy",
      "id name email role",
    );

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json({ project });
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ error: "Failed to fetch project" });
  }
}

export async function updateProject(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { id } = req.params;
  const updateData = req.body;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid project ID" });
  }

  // Prevent changing immutable fields
  if (updateData.projectCode || updateData.createdBy) {
    return res
      .status(400)
      .json({ error: "Cannot modify projectCode or createdBy" });
  }

  // Validate ProjectManager if provided
  if (
    updateData.projectManager &&
    !isValidObjectId(updateData.projectManager)
  ) {
    return res.status(400).json({ error: "Invalid projectManager ObjectId" });
  }

  // Validate Contractor if provided
  if (updateData.contractor && !isValidObjectId(updateData.contractor)) {
    return res.status(400).json({ error: "Invalid contractor ObjectId" });
  }

  // Validate latitude/longitude if provided
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

  // Validate totalBudget if provided
  if (updateData.totalBudget !== undefined) {
    const budget = parseFloat(updateData.totalBudget);
    if (isNaN(budget) || budget < 0) {
      return res.status(400).json({ error: "Budget must be non-negative" });
    }
  }

  // Validate status if provided
  if (updateData.status && !PROJECT_STATUSES.includes(updateData.status)) {
    return res.status(400).json({ error: "Invalid project status" });
  }

  try {
    const project = await ProjectModel.findByIdAndUpdate(
      id,
      {
        ...updateData,
        latitude: updateData.latitude
          ? parseFloat(updateData.latitude)
          : undefined,
        longitude: updateData.longitude
          ? parseFloat(updateData.longitude)
          : undefined,
        totalBudget: updateData.totalBudget
          ? parseFloat(updateData.totalBudget)
          : undefined,
      },
      { new: true },
    ).populate("projectManager contractor createdBy", "id name email role");

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json({
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ error: "Failed to update project" });
  }
}

export async function deleteProject(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid project ID" });
  }

  try {
    const project = await ProjectModel.findByIdAndDelete(id);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ error: "Failed to delete project" });
  }
}
