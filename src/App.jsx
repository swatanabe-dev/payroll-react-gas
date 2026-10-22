import { HashRouter, Navigate, Route, Routes } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

import AppLayout from "./ui/AppLayout";
import WorkLogs from "./pages/WorkLogs";
import User from "./pages/User";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import Salaries from "./pages/Salaries";
import Payslip from "./pages/Payslip";
import Prize from "./pages/Prize";
import WorkTypesForm from "./features/Settings/WorkTypesForm";
import HourlyWageForm from "./features/Settings/HourlyWageForm";
import MealForm from "./features/Settings/MealForm";
import TransportationForm from "./features/Settings/TransportationForm";
import Archives from "./features/Settings/Archives";

import { ModalProvider } from "./contexts/ModalContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000 * 30, // every 30min
      gcTime: 60 * 1000 * 45, // every 45min
      retry: false,
    },
  },
});

function App() {
  return (
    <ModalProvider>
      <QueryClientProvider client={queryClient}>
        <HashRouter>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Navigate replace to="worklogs" />} />
              <Route path="worklogs" element={<WorkLogs />} />

              <Route path="prizes" element={<Prize />} />
              <Route path="salaries" element={<Salaries />} />
              <Route path="salaries/:userId" element={<Payslip />} />
              <Route path="users" element={<Users />} />
              <Route path="users/:userId" element={<User />} />

              <Route path="settings" element={<Settings />}>
                <Route index element={<Navigate replace to="work-type" />} />
                <Route path="work-type" element={<WorkTypesForm />} />
                <Route path="hourly-wage" element={<HourlyWageForm />} />
                <Route path="meal" element={<MealForm />} />
                <Route path="transportation" element={<TransportationForm />} />
                <Route path="archives" element={<Archives />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>

        <Toaster
          position="top-center"
          gutter={12}
          containerStyle={{ margin: "8px" }}
          toastOptions={{
            success: {
              duration: 4000,
            },
            error: {
              duration: 5000,
            },
            style: {
              maxWidth: "500px",
              fontSize: "16px",
              color: "var(--color-gray-900)",
              backgroundColor: "var(--main-background-color)",
              border: "1px solid var(--border-color-light)",
              padding: "16px 24px",
            },
          }}
        />
      </QueryClientProvider>
    </ModalProvider>
  );
}

export default App;
