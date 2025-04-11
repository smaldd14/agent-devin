import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import routes, { RouteType } from "./config";

const Router = () => {
  const renderRoutes = (routes: RouteType[]) => {
    return routes.map((route) => {
      if (route.index) {
        return <Route index key={route.key} element={<route.component />} />;
      }
      return (
        <Route key={route.key} path={route.path} element={<route.component />}>
          {route.children && renderRoutes(route.children)}
        </Route>
      );
    });
  };

  return (
      <Suspense fallback={<div>Loading...</div>}>
        <div className="flex flex-col min-h-screen">
          <div className="flex-grow">
            <Routes>
              {renderRoutes(routes)}
            </Routes>
          </div>
        </div>
      </Suspense>
  );
};

export default Router;