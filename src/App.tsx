import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { setUnauthorizedHandler } from './api/apiClient';
import { getCurrentUser, type CurrentUser } from './api/auth';
import { AppShell } from './components/layout/AppShell';
import Identity from './common/Components/Identity';
import Login from './common/Components/Login';
import MachineLearningDashboard from './common/Components/MachineLearningDashboard';
import NotFound from './common/Components/NotFound';
import { AlgorithmCreatePage } from './common/Components/machine-learning/algorithms/AlgorithmCreatePage';
import { AlgorithmListPage } from './common/Components/machine-learning/algorithms/AlgorithmListPage';
import { AlgorithmReadPage } from './common/Components/machine-learning/algorithms/AlgorithmReadPage';
import { AlgorithmUpdatePage } from './common/Components/machine-learning/algorithms/AlgorithmUpdatePage';
import { ApiKeyCreatePage } from './common/Components/machine-learning/api-keys/ApiKeyCreatePage';
import { ApiKeyListPage } from './common/Components/machine-learning/api-keys/ApiKeyListPage';
import { ApiKeyReadPage } from './common/Components/machine-learning/api-keys/ApiKeyReadPage';
import { DataTypeCreatePage } from './common/Components/machine-learning/data-types/DataTypeCreatePage';
import { DataTypeListPage } from './common/Components/machine-learning/data-types/DataTypeListPage';
import { DataTypeReadPage } from './common/Components/machine-learning/data-types/DataTypeReadPage';
import { DataTypeUpdatePage } from './common/Components/machine-learning/data-types/DataTypeUpdatePage';
import { DatasetCreatePage } from './common/Components/machine-learning/datasets/DatasetCreatePage';
import { DatasetListPage } from './common/Components/machine-learning/datasets/DatasetListPage';
import { DatasetReadPage } from './common/Components/machine-learning/datasets/DatasetReadPage';
import { DatasetUpdatePage } from './common/Components/machine-learning/datasets/DatasetUpdatePage';
import { ModelCreatePage } from './common/Components/machine-learning/models/ModelCreatePage';
import { ModelDatasetAssignmentPage } from './common/Components/machine-learning/models/ModelDatasetAssignmentPage';
import { ModelListPage } from './common/Components/machine-learning/models/ModelListPage';
import { ModelReadPage } from './common/Components/machine-learning/models/ModelReadPage';
import { ModelUpdatePage } from './common/Components/machine-learning/models/ModelUpdatePage';

// Sends a visitor without a session to the login page and remembers where they wanted to go
function RedirectToLogin() {
  const location = useLocation();

  return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
}

function App() {
  // null = nobody is logged in. The session itself lives in Portio, the app only knows who the user is
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
    });

    return () => {
      setUnauthorizedHandler(null);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/machine-learning" replace /> : <Login />} />

      {/* Every page below needs a logged in user. This one check covers all of them:
          AppShell draws the sidebar and puts the page of the matching route next to it. */}
      <Route element={user ? <AppShell user={user} /> : <RedirectToLogin />}>
        <Route path="/" element={<Navigate to="/machine-learning" replace />} />
        <Route path="/machine-learning" element={<MachineLearningDashboard />} />

        <Route path="/machine-learning/models" element={<ModelListPage />} />
        <Route path="/machine-learning/models/create" element={<ModelCreatePage />} />
        <Route path="/machine-learning/models/:id" element={<ModelReadPage />} />
        <Route path="/machine-learning/models/:id/edit" element={<ModelUpdatePage />} />
        <Route path="/machine-learning/models/:id/datasets" element={<ModelDatasetAssignmentPage />} />

        <Route path="/machine-learning/datasets" element={<DatasetListPage />} />
        <Route path="/machine-learning/datasets/create" element={<DatasetCreatePage />} />
        <Route path="/machine-learning/datasets/:id" element={<DatasetReadPage />} />
        <Route path="/machine-learning/datasets/:id/edit" element={<DatasetUpdatePage />} />

        <Route path="/machine-learning/algorithms" element={<AlgorithmListPage />} />
        <Route path="/machine-learning/algorithms/create" element={<AlgorithmCreatePage />} />
        <Route path="/machine-learning/algorithms/:id" element={<AlgorithmReadPage />} />
        <Route path="/machine-learning/algorithms/:id/edit" element={<AlgorithmUpdatePage />} />

        <Route path="/machine-learning/data-types" element={<DataTypeListPage />} />
        <Route path="/machine-learning/data-types/create" element={<DataTypeCreatePage />} />
        <Route path="/machine-learning/data-types/:id" element={<DataTypeReadPage />} />
        <Route path="/machine-learning/data-types/:id/edit" element={<DataTypeUpdatePage />} />

        <Route path="/machine-learning/api-keys" element={<ApiKeyListPage />} />
        <Route path="/machine-learning/api-keys/create" element={<ApiKeyCreatePage />} />
        <Route path="/machine-learning/api-keys/:id" element={<ApiKeyReadPage />} />

        <Route path="/identity" element={<Identity />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
