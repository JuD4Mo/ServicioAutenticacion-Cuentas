import express from "express";
import { actualizarCuentaConOtp, getCuenta, login, register, eliminarCuenta, sendOtp, verifyOtp, resetPassword, cambiarPassword} from "../controllers/cuentasController.js";
import { verificarToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/getCuenta/:id", getCuenta);
router.get('/perfil', verificarToken, async (req, res) => {
    res.json({ message: "Bienvenido a tu perfil", user: req.user });
});

router.post("/register", register);
router.post("/login", login);
router.post("/reset-password", resetPassword);
router.post("/cambiar-password", cambiarPassword);


router.patch("/actualizar-con-otp", actualizarCuentaConOtp);

router.delete("/eliminar/:id", eliminarCuenta);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
export default router;
