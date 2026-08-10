import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { addFavorite, getMyFavorites, removeFavorite } from "../controllers/favorite.controller";
import { createSavedSearch, deleteSavedSearch, getMySavedSearches } from "../controllers/savedSearch.controller";
import { applyForLoan, getMyLoans } from "../controllers/loan.controller";
import { getMyBuyerInquiries } from "../controllers/inquiry.controller";

const router = Router();

router.use(requireAuth);

router.get("/favorites", getMyFavorites);
router.post("/favorites", addFavorite);
router.delete("/favorites/:id", removeFavorite);

router.get("/saved-searches", getMySavedSearches);
router.post("/saved-searches", createSavedSearch);
router.delete("/saved-searches/:id", deleteSavedSearch);

router.post("/loans/apply", applyForLoan);
router.get("/loans/mine", getMyLoans);

router.get("/inquiries", getMyBuyerInquiries);

export default router;
