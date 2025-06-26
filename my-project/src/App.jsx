import { Routes, Route, Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { SpaceFormProvider } from './context/SpaceFormContext';
import { BookingFormProvider } from './context/BookingFormContext';
import { PipelineProvider } from './context/PipelineContext';
import { AuthProvider } from './context/AuthContext.jsx';
import { ReactFlowProvider } from '@xyflow/react';

// Page & Component Imports
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword'; // New import
import HomePage from './components/HomePage';
import InventoryDashboard from './components/Inventory';
import AddSpaceForm from './components/AddSpaceForm';
import PreviewAddSpaceForm from './components/PreviewAddSpaceForm';
import SpaceDetails from './components/SpaceDetails';
import EditSpace from './components/EditSpace';
import BookingsDashboard1 from './components/BookingDashboard';
import BookingDetails from './components/BookingDetails';
import CreateBookingOrderForm from './components/BookingForm';
import BookingFormOrderInfo from './components/BookingFormOrderInfo';
import BookingFormAddSpaces from './components/BookingFormAddSpaces';
import BookingPreview from './components/BookingPreview';
import BookingFormWizard from './components/BookingFormWizard';
import ProposalDashboard from './components/Proposals';
import ProposalForm from './components/ProposalForm';
import ProposalDetails from './components/ProposalDetails';
import EditProposal from './components/EditProposal';
import User from './components/User';
import FinancePage from './components/FinancePage';
import Gallery from './components/Gallery';
import Report from './components/Report.jsx';
import PipelineBoard from './components/PipelineBoard';
import CampaignPipeline from './components/CampaignPipeline';
import CampaignDetails from './components/CampaignDetails';

export default function App() {
  return (
    <AuthProvider>
      <div>
        <Toaster position="top-right" />
        <Routes>
          {/* =================================================================
           PUBLIC ROUTES (Accessible without logging in)
          ================================================================== */}
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/create-user' element={<Register />} /> {/* Alias for register */}
          <Route path='/forgot-password' element={<ForgotPassword />} />


          {/* =================================================================
           PROTECTED ROUTES (Require authentication)
          ================================================================== */}
          <Route path='/' element={<ProtectedRoute><InventoryDashboard /></ProtectedRoute>} />
          <Route path='/home' element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path='/inventory' element={<ProtectedRoute><InventoryDashboard /></ProtectedRoute>} />
          <Route path='/users' element={<ProtectedRoute><User /></ProtectedRoute>} />
          <Route path='/finances' element={<ProtectedRoute><FinancePage /></ProtectedRoute>} />
          <Route path='/gallery' element={<ProtectedRoute><Gallery /></ProtectedRoute>} />
          <Route path='/reports' element={<ProtectedRoute><Report /></ProtectedRoute>} />
          
          {/* Space Management */}
          <Route path='/add-space' element={
            <ProtectedRoute>
              <SpaceFormProvider>
                <AddSpaceForm />
              </SpaceFormProvider>
            </ProtectedRoute>
          } />
          <Route path='/preview-add-space' element={
            <ProtectedRoute>
              <SpaceFormProvider>
                <PreviewAddSpaceForm />
              </SpaceFormProvider>
            </ProtectedRoute>
          } />
          <Route path='/space/:id' element={<ProtectedRoute><SpaceDetails /></ProtectedRoute>} />
          <Route path='/space/:id/edit' element={<ProtectedRoute><EditSpace /></ProtectedRoute>} />

          {/* Booking & Campaign Management */}
          <Route path='/booking-dashboard' element={<ProtectedRoute><BookingsDashboard1 /></ProtectedRoute>} />
          <Route path='/booking/:id' element={<ProtectedRoute><BookingDetails /></ProtectedRoute>} />
          <Route path='/campaign-details/:id' element={
            <ProtectedRoute>
              <PipelineProvider>
                <ReactFlowProvider>
                  <CampaignDetails />
                </ReactFlowProvider>
              </PipelineProvider>
            </ProtectedRoute>
          } />

          {/* Booking Form Wizard Routes (Grouped with BookingFormProvider) */}
          <Route element={
            <ProtectedRoute>
              <BookingFormProvider>
                <Outlet />
              </BookingFormProvider>
            </ProtectedRoute>
          }>
            <Route path="/create-booking" element={<CreateBookingOrderForm />} />
            <Route path="/create-booking-orderInfo" element={<BookingFormOrderInfo />} />
            <Route path="/create-booking-addSpaces" element={<BookingFormAddSpaces />} />
            <Route path="/booking-preview" element={<BookingPreview />} />
            <Route path='/booking-fullForm' element={<BookingFormWizard />} />
          </Route>
          
          {/* Proposal Management */}
          <Route path='/proposal-dashboard' element={<ProtectedRoute><ProposalDashboard /></ProtectedRoute>} />
          <Route path='/proposal-form' element={<ProtectedRoute><ProposalForm /></ProtectedRoute>} />
          <Route path="/proposal/:id" element={<ProtectedRoute><ProposalDetails /></ProtectedRoute>} />
          <Route path="/proposal/:id/edit" element={<ProtectedRoute><EditProposal /></ProtectedRoute>} />
          
          {/* Pipeline & Flow Management */}
          <Route path='/pipeline' element={
            <ProtectedRoute>
              <PipelineProvider>
                <ReactFlowProvider>
                  <CampaignPipeline />
                </ReactFlowProvider>
              </PipelineProvider>
            </ProtectedRoute>
          } />
          <Route path='/pipeline/:id' element={
            <ProtectedRoute>
              <PipelineProvider>
                <ReactFlowProvider>
                  <CampaignPipeline />
                </ReactFlowProvider>
              </PipelineProvider>
            </ProtectedRoute>
          } />
           <Route path="/pipeline-board" element={<ProtectedRoute><PipelineBoard /></ProtectedRoute>} />

        </Routes>
      </div>
    </AuthProvider>
  );
}