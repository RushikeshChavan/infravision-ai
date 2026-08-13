import { Request, Response } from "express";
import BudgetModel from "../models/budget";
import ProjectModel from "../models/project";
import { isValidObjectId } from "../utils/validation";

export async function createBudget(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { project, allocatedAmount, utilizedAmount, category, description } =
    req.body;

  if (!project || !category || allocatedAmount === undefined) {
    return res.status(400).json({
      error: "Project, category, and allocatedAmount are required",
    });
  }

  if (!isValidObjectId(project)) {
    return res.status(400).json({ error: "Invalid project ObjectId" });
  }

  const projectExists = await ProjectModel.findById(project);
  if (!projectExists) {
    return res.status(404).json({ error: "Project not found" });
  }

  const allocated = parseFloat(allocatedAmount);
  if (isNaN(allocated) || allocated < 0) {
    return res
      .status(400)
      .json({ error: "Allocated amount must be non-negative" });
  }

  const utilized = utilizedAmount ? parseFloat(utilizedAmount) : 0;
  if (isNaN(utilized) || utilized < 0) {
    return res
      .status(400)
      .json({ error: "Utilized amount must be non-negative" });
  }

  if (utilized > allocated) {
    return res.status(400).json({
      error: "Utilized amount cannot exceed allocated amount",
    });
  }

  try {
    const remaining = allocated - utilized;

    const budget = new BudgetModel({
      project,
      allocatedAmount: allocated,
      utilizedAmount: utilized,
      remainingAmount: remaining,
      category,
      description,
      lastUpdatedBy: req.user.id,
    });

    await budget.save();

    res.status(201).json({
      message: "Budget created successfully",
      budget,
    });
  } catch (error) {
    console.error("Error creating budget:", error);
    res.status(500).json({ error: "Failed to create budget" });
  }
}

export async function getBudgetsByProject(req: Request, res: Response) {
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
    const budgets = await BudgetModel.find({ project: projectId }).populate(
      "lastUpdatedBy",
      "id name email",
    );

    res.json({ budgets });
  } catch (error) {
    console.error("Error fetching budgets:", error);
    res.status(500).json({ error: "Failed to fetch budgets" });
  }
}

export async function getBudgetById(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid budget ID" });
  }

  try {
    const budget = await BudgetModel.findById(id).populate(
      "lastUpdatedBy",
      "id name email",
    );

    if (!budget) {
      return res.status(404).json({ error: "Budget not found" });
    }

    res.json({ budget });
  } catch (error) {
    console.error("Error fetching budget:", error);
    res.status(500).json({ error: "Failed to fetch budget" });
  }
}

export async function updateBudget(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { id } = req.params;
  const { allocatedAmount, utilizedAmount, category, description } = req.body;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid budget ID" });
  }

  // Prevent changing project reference
  if (req.body.project) {
    return res.status(400).json({ error: "Cannot modify project reference" });
  }

  // Prevent direct modification of lastUpdatedBy
  if (req.body.lastUpdatedBy) {
    return res
      .status(400)
      .json({ error: "Cannot modify lastUpdatedBy directly" });
  }

  try {
    const budget = await BudgetModel.findById(id);
    if (!budget) {
      return res.status(404).json({ error: "Budget not found" });
    }

    const newAllocated =
      allocatedAmount !== undefined
        ? parseFloat(allocatedAmount)
        : budget.allocatedAmount;
    const newUtilized =
      utilizedAmount !== undefined
        ? parseFloat(utilizedAmount)
        : budget.utilizedAmount;

    if (isNaN(newAllocated) || newAllocated < 0) {
      return res
        .status(400)
        .json({ error: "Allocated amount must be non-negative" });
    }

    if (isNaN(newUtilized) || newUtilized < 0) {
      return res
        .status(400)
        .json({ error: "Utilized amount must be non-negative" });
    }

    if (newUtilized > newAllocated) {
      return res.status(400).json({
        error: "Utilized amount cannot exceed allocated amount",
      });
    }

    const updatedBudget = await BudgetModel.findByIdAndUpdate(
      id,
      {
        allocatedAmount: newAllocated,
        utilizedAmount: newUtilized,
        remainingAmount: newAllocated - newUtilized,
        category: category || budget.category,
        description:
          description !== undefined ? description : budget.description,
        lastUpdatedBy: req.user.id,
      },
      { new: true },
    ).populate("lastUpdatedBy", "id name email");

    res.json({
      message: "Budget updated successfully",
      budget: updatedBudget,
    });
  } catch (error) {
    console.error("Error updating budget:", error);
    res.status(500).json({ error: "Failed to update budget" });
  }
}

export async function deleteBudget(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid budget ID" });
  }

  try {
    const budget = await BudgetModel.findByIdAndDelete(id);

    if (!budget) {
      return res.status(404).json({ error: "Budget not found" });
    }

    res.json({ message: "Budget deleted successfully" });
  } catch (error) {
    console.error("Error deleting budget:", error);
    res.status(500).json({ error: "Failed to delete budget" });
  }
}
