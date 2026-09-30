import express from "express";
import {
  createComplaintRecord,
  getComplaintsList,
  getComplaintById,
  updateComplaintStatus
} from "../services/firebaseService.js";

const router = express.Router();

/**
 * POST /api/complaints
 * Creates a new complaint (citizen submitted)
 */
router.post("/", async (req, res) => {
  try {
    const data = req.body;

    if (!data.userId) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameter: userId is mandatory."
      });
    }

    if (!data.description && !data.text && !data.title) {
      return res.status(400).json({
        success: false,
        error: "Missing complaint description or title."
      });
    }

    const complaint = await createComplaintRecord(data);

    return res.status(201).json({
      success: true,
      complaintId: complaint.complaintId,
      data: complaint
    });
  } catch (error) {
    console.error("[ComplaintRoutes] POST / error:", error.message || error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to create complaint record."
    });
  }
});

/**
 * GET /api/complaints
 * Query complaints with optional filters (userId, status, category, ward)
 */
router.get("/", async (req, res) => {
  try {
    const { userId, status, category, ward } = req.query;
    const complaints = await getComplaintsList({ userId, status, category, ward });

    return res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints
    });
  } catch (error) {
    console.error("[ComplaintRoutes] GET / error:", error.message || error);
    return res.status(500).json({
      success: false,
      error: "Failed to retrieve complaints."
    });
  }
});

/**
 * GET /api/complaints/:id
 * Fetches a single complaint by tracking ID
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await getComplaintById(id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        error: `Complaint '${id}' not found.`
      });
    }

    return res.status(200).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    console.error(`[ComplaintRoutes] GET /:id error for ${req.params.id}:`, error.message || error);
    return res.status(500).json({
      success: false,
      error: "Failed to retrieve complaint details."
    });
  }
});

/**
 * PATCH /api/complaints/:complaintId/status
 * Updates status of a complaint by Municipal Authority
 */
router.patch("/:complaintId/status", async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { status, remarks, updatedBy } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameter: status is required."
      });
    }

    const updated = await updateComplaintStatus(
      complaintId,
      status,
      remarks,
      updatedBy || "Municipal Authority"
    );

    return res.status(200).json({
      success: true,
      message: `Status of ${complaintId} updated to ${status}.`,
      data: updated
    });
  } catch (error) {
    console.error(`[ComplaintRoutes] PATCH /status error for ${req.params.complaintId}:`, error.message || error);
    const statusCode = error.message?.includes("not found") ? 404 : 500;
    return res.status(statusCode).json({
      success: false,
      error: error.message || "Failed to update complaint status."
    });
  }
});

export default router;
