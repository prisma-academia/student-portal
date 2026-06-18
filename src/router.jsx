import { createBrowserRouter, Outlet } from "react-router-dom";
import { lazy } from "react";
import AuthLayout from "./layout/auth";
import ForgotPassword from "./pages/auth/forgot-password";
import ResetPassword from "./pages/auth/reset-password";
import ChangePassword from "./pages/auth/change-password";
import RouteErrorFallback from "./component/RouteErrorFallback";
const SignIn = lazy(() => import("./pages/auth/login"));
const Setup = lazy(() => import("./pages/auth/setup"));
const Home = lazy(() => import("./pages/home/view"));
const Timeline = lazy(() => import("./pages/school/view"));
const PaymentStatus = lazy(() => import("./pages/payment/status"));
const Resource = lazy(() => import("./pages/resource/view"));
const Profile = lazy(() => import("./pages/profile/view"));
const DashboardLayout = lazy(() => import("./layout/dashbord"));

const router = createBrowserRouter([
  {
    path: "/auth",
    element: (
      <AuthLayout>
        <Outlet />
      </AuthLayout>
    ),
    errorElement: <RouteErrorFallback />,
    children: [
      {
        path: "sign-in",
        element: <SignIn />,
      },
      {
        path: "setup",
        element: <Setup />,
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "reset-password",
        element: <ResetPassword />,
      },
      {
        path: "change-password",
        element: <ChangePassword />,
      },
    ],
  },
  {
    path: "/",
    element: (
      <DashboardLayout>
        <Outlet />
      </DashboardLayout>
    ),
    errorElement: <RouteErrorFallback />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/school",
        element: <Timeline />,
      },
      {
        path: "/payment/status",
        element: <PaymentStatus />,
      },
      {
        path: "/resource",
        element: <Resource />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
    ],
  },
]);

export default router;
