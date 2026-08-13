import { Request, Response } from "express";
import ContractorModel, { CONTRACTOR_STATUS } from "../models/contractor";
import { isValidObjectId } from "../utils/validation";

export async function createContractor(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const {
    companyName,
    registrationNumber,
    contactPerson,
    email,
    phone,
    address,
    performanceScore,
    status,
  } = req.body;

  if (!companyName || !registrationNumber || !contactPerson) {
    return res.status(400).json({
      error:
        "Company name, registration number, and contact person are required",
    });
  }

  if (performanceScore !== undefined) {
    const score = parseFloat(performanceScore);
    if (isNaN(score) || score < 0 || score > 100) {
      return res
        .status(400)
        .json({ error: "Performance score must be between 0 and 100" });
    }
  }

  if (status && !CONTRACTOR_STATUS.includes(status)) {
    return res.status(400).json({ error: "Invalid contractor status" });
  }

  // Prevent clients from directly assigning a User
  if (req.body.user) {
    return res.status(400).json({
      error: "Cannot directly assign user account during creation",
    });
  }

  try {
    const contractor = new ContractorModel({
      companyName,
      registrationNumber,
      contactPerson,
      email: email ? email.toLowerCase() : undefined,
      phone,
      address,
      performanceScore: performanceScore ? parseFloat(performanceScore) : 0,
      status: status || "Pending",
      user: null,
    });

    await contractor.save();

    res.status(201).json({
      message: "Contractor created successfully",
      contractor,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ error: "Registration number already exists" });
    }

    console.error("Error creating contractor:", error);
    res.status(500).json({ error: "Failed to create contractor" });
  }
}

export async function getContractors(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const contractors = await ContractorModel.find().populate(
      "user",
      "id name email role",
    );

    res.json({ contractors });
  } catch (error) {
    console.error("Error fetching contractors:", error);
    res.status(500).json({ error: "Failed to fetch contractors" });
  }
}

export async function getContractorById(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid contractor ID" });
  }

  try {
    const contractor = await ContractorModel.findById(id).populate(
      "user",
      "id name email role",
    );

    if (!contractor) {
      return res.status(404).json({ error: "Contractor not found" });
    }

    res.json({ contractor });
  } catch (error) {
    console.error("Error fetching contractor:", error);
    res.status(500).json({ error: "Failed to fetch contractor" });
  }
}

export async function updateContractor(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { id } = req.params;
  const updateData = req.body;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid contractor ID" });
  }

  // Prevent changing registration number
  if (updateData.registrationNumber) {
    return res.status(400).json({ error: "Cannot modify registration number" });
  }

  // Prevent clients from directly modifying user field
  if (updateData.user) {
    return res.status(400).json({
      error: "Cannot modify user account through this endpoint",
    });
  }

  if (updateData.performanceScore !== undefined) {
    const score = parseFloat(updateData.performanceScore);
    if (isNaN(score) || score < 0 || score > 100) {
      return res
        .status(400)
        .json({ error: "Performance score must be between 0 and 100" });
    }
  }

  if (updateData.status && !CONTRACTOR_STATUS.includes(updateData.status)) {
    return res.status(400).json({ error: "Invalid contractor status" });
  }

  try {
    const contractor = await ContractorModel.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("user", "id name email role");

    if (!contractor) {
      return res.status(404).json({ error: "Contractor not found" });
    }

    res.json({
      message: "Contractor updated successfully",
      contractor,
    });
  } catch (error) {
    console.error("Error updating contractor:", error);
    res.status(500).json({ error: "Failed to update contractor" });
  }
}

export async function deleteContractor(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid contractor ID" });
  }

  try {
    const contractor = await ContractorModel.findByIdAndDelete(id);

    if (!contractor) {
      return res.status(404).json({ error: "Contractor not found" });
    }

    res.json({ message: "Contractor deleted successfully" });
  } catch (error) {
    console.error("Error deleting contractor:", error);
    res.status(500).json({ error: "Failed to delete contractor" });
  }
}
