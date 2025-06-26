

// import React, { useCallback, useEffect, useState, useContext } from 'react';
// import { useParams } from 'react-router-dom';
// import {
//   ReactFlow,
//   useNodesState,
//   useEdgesState,
//   addEdge,
//   useReactFlow,
//   ReactFlowProvider,
// } from '@xyflow/react';
// import '@xyflow/react/dist/style.css';

// import BookingStatusForm from './modals/BookingStatusForm';
// import POForm from './modals/PoStatus';
// import ArtworkForm from './modals/ArtworkStatus';
// import InvoiceForm from './modals/InvoiceDetailsForm';
// import PaymentStatusForm from './modals/PaymentStatusForm';
// import PrintingStatus from './modals/PrintingStatus';
// import MountingStatus from './modals/MountingStatus';
// import { toast } from 'sonner';
// import { PipelineContext } from '../context/PipelineContext';
// import axios from 'axios';

// const baseNodeStyle = {
//   padding: 10,
//   border: '2px solid',
//   borderRadius: 8,
//   fontWeight: 600,
// };

// function CampaignPipelineInternal({ campaignId }) {
//   const { id } = useParams();
//   const CampaignId = campaignId || id;

//   const [nodes, setNodes, onNodesChange] = useNodesState([]);
//   const [edges, setEdges, onEdgesChange] = useEdgesState([]);
//   const [selectedNode, setSelectedNode] = useState(null);
//   const { pipelineData, setPipelineData } = useContext(PipelineContext);
//   const [spaces, setSpaces] = useState([]);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [refreshKey, setRefreshKey] = useState(0);

//   const { fitView } = useReactFlow();
//   const triggerRefresh = () => setRefreshKey(prev => prev + 1);

//   const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);
//   const onNodeClick = (_, node) => {
//     if (!node.id.startsWith('inventory-')) {
//       setSelectedNode(node);
//     }
//   };

//   useEffect(() => {
//     const fetchOrCreatePipeline = async () => {
//       try {
//         const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/pipeline/campaign/${CampaignId}`);
//         setPipelineData(res.data);
//         console.log("Pip data is",res.data);
//       } catch (err) {
//         if (err.response?.status === 404) {
//           const createRes = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/pipeline/campaign/${CampaignId}`);
//           setPipelineData(createRes.data);
//         } else {
//           console.error('Error fetching/creating pipeline:', err);
//         }
//       }
//     };

//     if (CampaignId) fetchOrCreatePipeline();
//   }, [CampaignId, refreshKey]);

//   useEffect(() => {
//     const fetchSpaces = async () => {
//       try {
//         const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/pipeline/campaign/${CampaignId}`);
//         const populatedSpaces = res.data.spaces.map(s => s.id);
//         setSpaces(populatedSpaces);
//       } catch (error) {
//         console.error('Failed to fetch campaign spaces:', error);
//       }
//     };

//     if (pipelineData?.artwork?.confirmed) {
//       fetchSpaces();
//     }
//   }, [pipelineData?.artwork?.confirmed, CampaignId]);

//   useEffect(() => {
//     if (!pipelineData) return;

//     let dynamicNodes = [];
//     let dynamicEdges = [];

//     const staticNodes = [
//       {
//         id: 'booking',
//         data: { label: 'Booking confirmed' },
//         position: { x: 0, y: 200 },
//         style: { ...baseNodeStyle, background: '#d1fae5', borderColor: '#10b981' },
//       },
//     ];

//     const staticEdges = [];

//     if (pipelineData.bookingStatus?.confirmed) {
//       staticNodes.push(
//         { id: 'po', data: { label: 'PO status' }, position: { x: 250, y: 200 }, style: { ...baseNodeStyle, background: '#bfdbfe', borderColor: '#3b82f6' } },
//         { id: 'artwork', data: { label: 'Artwork' }, position: { x: 450, y: 200 }, style: { ...baseNodeStyle, background: '#fbcfe8', borderColor: '#ec4899' } },
//         { id: 'invoice', data: { label: 'Invoice details' }, position: { x: 250, y: 400 }, style: { ...baseNodeStyle, background: '#fef3c7', borderColor: '#facc15' } },
//       );
//       staticEdges.push(
//         { id: 'e-booking-po', source: 'booking', target: 'po', markerEnd: 'arrowclosed' },
//         { id: 'e-po-artwork', source: 'po', target: 'artwork', markerEnd: 'arrowclosed' },
//         { id: 'e-po-invoice', source: 'po', target: 'invoice', markerEnd: 'arrowclosed' },
//       );
//     }

//     if (pipelineData.invoice?.invoiceNumber) {
//       staticNodes.push({
//         id: 'payment',
//         data: { label: 'Payment status' },
//         position: { x: 450, y: 400 },
//         style: { ...baseNodeStyle, background: '#ede9fe', borderColor: '#8b5cf6' },
//       });
//       staticEdges.push({
//         id: 'e-invoice-payment',
//         source: 'invoice',
//         target: 'payment',
//         markerEnd: 'arrowclosed',
//       });
//     }

//     if (pipelineData.artwork?.confirmed && pipelineData.spaces.length > 0) {
//       pipelineData.spaces.forEach((space, index) => {
//         const inventoryId = `inventory-${space._id}`;
//         const printId = `print-${space._id}`;
//         const mountId = `mount-${space._id}`;

//         dynamicNodes.push(
//           { id: inventoryId, data: { label: space.spaceName }, position: { x: 650, y: 100 + index * 200 }, style: { ...baseNodeStyle, background: '#bfdbfe', borderColor: '#3b82f6' } },
//           { id: printId, data: { label: 'Printing status' }, position: { x: 850, y: 100 + index * 200 }, style: { ...baseNodeStyle, background: '#ede9fe', borderColor: '#8b5cf6' } },
//           { id: mountId, data: { label: 'Mounting status' }, position: { x: 1050, y: 100 + index * 200 }, style: { ...baseNodeStyle, background: '#fecaca', borderColor: '#ef4444' } },
//         );

//         dynamicEdges.push(
//           { id: `e-artwork-${space._id}`, source: 'artwork', target: inventoryId, markerEnd: 'arrowclosed' },
//           { id: `e-${space._id}-print`, source: inventoryId, target: printId, markerEnd: 'arrowclosed' },
//         );

//         if (space.printingStatus?.confirmed) {
//           dynamicEdges.push({ id: `e-print-${space._id}-mount`, source: printId, target: mountId, markerEnd: 'arrowclosed' });
//         }
//       });
//     }

//     setNodes([...staticNodes, ...dynamicNodes]);
//     setEdges([...staticEdges, ...dynamicEdges]);

//     // ✅ Use timeout to let layout render before calling fitView
//     setTimeout(() => {
//       fitView({ padding: 0.2, duration: 500 });
//     }, 0);
//   }, [pipelineData, spaces]);

//   if (!pipelineData) return <div>Loading Campaign Pipeline Data...</div>;

//   return (
//     <div className="w-[160%] bg-white h-[100vh] relative">
//       <button
//         onClick={() => setShowDeleteModal(true)}
//         className="absolute top-4 right-6 bg-red-600 text-white text-sm px-4 py-1 rounded shadow hover:bg-red-700 z-50"
//       >
//         Delete Pipeline
//       </button>

//       <ReactFlow
//         nodes={nodes}
//         edges={edges}
//         onNodesChange={onNodesChange}
//         onEdgesChange={onEdgesChange}
//         onConnect={onConnect}
//         onNodeClick={onNodeClick}
//         zoomOnScroll={false}
//         panOnScroll={false}
//         fitView
//       />

//       {selectedNode && (
//         <div style={modalStyle}>
//           <div style={modalContentStyle} className="bg-white shadow-lg rounded-lg p-6 border">
//             {selectedNode.id === 'booking' && <BookingStatusForm campaignId={CampaignId} onClose={() => setSelectedNode(null)} onConfirm={() => { setSelectedNode(null); triggerRefresh(); }} />}
//             {selectedNode.id === 'po' && <POForm campaignId={CampaignId} onClose={() => setSelectedNode(null)} onConfirm={() => { setSelectedNode(null); triggerRefresh(); }} />}
//             {selectedNode.id === 'artwork' && <ArtworkForm campaignId={CampaignId} onClose={() => setSelectedNode(null)} onConfirm={() => { setSelectedNode(null); triggerRefresh(); }} />}
//             {selectedNode.id === 'invoice' && <InvoiceForm campaignId={CampaignId} onClose={() => setSelectedNode(null)} onConfirm={() => { setSelectedNode(null); triggerRefresh(); }} />}
//             {selectedNode.id === 'payment' && <PaymentStatusForm campaignId={CampaignId} onClose={() => setSelectedNode(null)} onConfirm={() => { setSelectedNode(null); triggerRefresh(); }} />}
//             {selectedNode.id.startsWith('print-') && <PrintingStatus spaceId={selectedNode.id.split('-')[1]} onClose={() => setSelectedNode(null)} onConfirm={() => { setSelectedNode(null); triggerRefresh(); }} />}
//             {selectedNode.id.startsWith('mount-') && <MountingStatus spaceId={selectedNode.id.split('-')[1]} onClose={() => setSelectedNode(null)} onConfirm={() => { setSelectedNode(null); triggerRefresh(); }} />}
//           </div>
//         </div>
//       )}

//       {showDeleteModal && (
//         <div style={modalStyle}>
//           <div style={{ ...modalContentStyle, width: '400px', height: '200px' }}>
//             <h3 className="text-xl font-semibold mb-4">Are you sure you want to delete this pipeline?</h3>
//             <div className="flex justify-center gap-4">
//               <button
//                 onClick={async () => {
//                   try {
//                     await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/pipeline/campaign/${CampaignId}`);
//                     setPipelineData(null);
//                     setShowDeleteModal(false);
//                     window.location.reload();
//                   } catch (err) {
//                     console.error('Failed to delete pipeline:', err);
//                     toast.error('Error deleting pipeline');
//                   }
//                 }}
//                 className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
//               >
//                 Yes, Delete
//               </button>
//               <button
//                 onClick={() => setShowDeleteModal(false)}
//                 className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default function CampaignPipelineWrapper(props) {
//   return (
//     <ReactFlowProvider>
//       <CampaignPipelineInternal {...props} />
//     </ReactFlowProvider>
//   );
// }

// const modalStyle = {
//   position: 'fixed',
//   top: 0,
//   left: 0,
//   zIndex: 1000,
//   width: '100vw',
//   height: '100vh',
//   backgroundColor: 'rgba(0,0,0,0.5)',
//   display: 'flex',
//   justifyContent: 'center',
//   alignItems: 'center',
// };

// const modalContentStyle = {
//   background: 'white',
//   padding: '20px',
//   borderRadius: '12px',
//   display: 'inline-flex',
//   flexDirection: 'column',
//   maxHeight: '80vh',
//   maxWidth: '90vw',
//   overflowY: 'auto',
//   boxSizing: 'border-box',
// };



import React, { useCallback, useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import BookingStatusForm from './modals/BookingStatusForm';
import POForm from './modals/PoStatus';
import ArtworkForm from './modals/ArtworkStatus';
import InvoiceForm from './modals/InvoiceDetailsForm';
import PaymentStatusForm from './modals/PaymentStatusForm';
import PrintingStatus from './modals/PrintingStatus';
import MountingStatus from './modals/MountingStatus';
import { toast } from 'sonner';
import { PipelineContext } from '../context/PipelineContext';
import axios from 'axios';

const baseNodeStyle = {
  padding: 10,
  border: '2px solid',
  borderRadius: 8,
  fontWeight: 600,
};

function CampaignPipelineInternal({ campaignId }) {
  const { id } = useParams();
  const CampaignId = campaignId || id;

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const { pipelineData, setPipelineData } = useContext(PipelineContext);
  const [spaces, setSpaces] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const { fitView } = useReactFlow();
  const triggerRefresh = () => setRefreshKey(prev => prev + 1);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);
  const onNodeClick = (_, node) => {
    if (!node.id.startsWith('inventory-')) {
      setSelectedNode(node);
    }
  };

  const isNodeCompleted = (nodeId, space = null) => {
    if (nodeId === 'booking') return pipelineData?.bookingStatus?.confirmed;
    // if (nodeId === 'po') return !!pipelineData?.poStatus;
    if (nodeId === 'po') return pipelineData?.po?.confirmed; 
    if (nodeId === 'artwork') return pipelineData?.artwork?.confirmed;
    if (nodeId === 'invoice') return !!pipelineData?.invoice?.invoiceNumber;
    if (nodeId === 'payment') return pipelineData?.payment?.payments?.length > 0;
    if (nodeId.startsWith('print-')) return space?.printingStatus?.confirmed;
    if (nodeId.startsWith('mount-')) return space?.mountingStatus?.confirmed;
    return false;
  };

  const getNodeStyle = (isComplete) => {
    const bgColor = isComplete ? '#d1fae5' : '#fef08a'; // green or yellow
    return {
      ...baseNodeStyle,
      background: bgColor,
      borderColor: bgColor,
    };
  };

  useEffect(() => {
    const fetchOrCreatePipeline = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/pipeline/campaign/${CampaignId}`);
        setPipelineData(res.data);
        console.log("Pip data is", res.data);
      } catch (err) {
        if (err.response?.status === 404) {
          const createRes = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/pipeline/campaign/${CampaignId}`);
          setPipelineData(createRes.data);
        } else {
          console.error('Error fetching/creating pipeline:', err);
        }
      }
    };

    if (CampaignId) fetchOrCreatePipeline();
  }, [CampaignId, refreshKey]);

  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/pipeline/campaign/${CampaignId}`);
        const populatedSpaces = res.data.spaces.map(s => s.id);
        setSpaces(populatedSpaces);
      } catch (error) {
        console.error('Failed to fetch campaign spaces:', error);
      }
    };

    if (pipelineData?.artwork?.confirmed) {
      fetchSpaces();
    }
  }, [pipelineData?.artwork?.confirmed, CampaignId]);

  useEffect(() => {
    if (!pipelineData) return;

    let dynamicNodes = [];
    let dynamicEdges = [];

    const staticNodes = [
      {
        id: 'booking',
        data: { label: 'Booking confirmed' },
        position: { x: 0, y: 200 },
        style: getNodeStyle(isNodeCompleted('booking')),
      },
    ];

    const staticEdges = [];

    if (pipelineData.bookingStatus?.confirmed) {
      staticNodes.push(
        {
          id: 'po',
          data: { label: 'PO status' },
          position: { x: 250, y: 200 },
          style: getNodeStyle(isNodeCompleted('po')),
        },
        {
          id: 'artwork',
          data: { label: 'Artwork' },
          position: { x: 450, y: 200 },
          style: getNodeStyle(isNodeCompleted('artwork')),
        },
        {
          id: 'invoice',
          data: { label: 'Invoice details' },
          position: { x: 250, y: 400 },
          style: getNodeStyle(isNodeCompleted('invoice')),
        },
      );
      staticEdges.push(
        { id: 'e-booking-po', source: 'booking', target: 'po', markerEnd: 'arrowclosed' },
        { id: 'e-po-artwork', source: 'po', target: 'artwork', markerEnd: 'arrowclosed' },
        { id: 'e-po-invoice', source: 'po', target: 'invoice', markerEnd: 'arrowclosed' },
      );
    }

    if (pipelineData.invoice?.invoiceNumber) {
      staticNodes.push({
        id: 'payment',
        data: { label: 'Payment status' },
        position: { x: 450, y: 400 },
        style: getNodeStyle(isNodeCompleted('payment')),
      });
      staticEdges.push({
        id: 'e-invoice-payment',
        source: 'invoice',
        target: 'payment',
        markerEnd: 'arrowclosed',
      });
    }

    if (pipelineData.artwork?.confirmed && pipelineData.spaces.length > 0) {
      pipelineData.spaces.forEach((space, index) => {
        const inventoryId = `inventory-${space._id}`;
        const printId = `print-${space._id}`;
        const mountId = `mount-${space._id}`;

        dynamicNodes.push(
          {
            id: inventoryId,
            data: { label: space.spaceName },
            position: { x: 650, y: 100 + index * 200 },
            style: getNodeStyle(true), // always completed
          },
          {
            id: printId,
            data: { label: 'Printing status' },
            position: { x: 850, y: 100 + index * 200 },
            style: getNodeStyle(isNodeCompleted(printId, space)),
          },
          {
            id: mountId,
            data: { label: 'Mounting status' },
            position: { x: 1050, y: 100 + index * 200 },
            style: getNodeStyle(isNodeCompleted(mountId, space)),
          },
        );

        dynamicEdges.push(
          { id: `e-artwork-${space._id}`, source: 'artwork', target: inventoryId, markerEnd: 'arrowclosed' },
          { id: `e-${space._id}-print`, source: inventoryId, target: printId, markerEnd: 'arrowclosed' },
        );

        if (space.printingStatus?.confirmed) {
          dynamicEdges.push({ id: `e-print-${space._id}-mount`, source: printId, target: mountId, markerEnd: 'arrowclosed' });
        }
      });
    }

    setNodes([...staticNodes, ...dynamicNodes]);
    setEdges([...staticEdges, ...dynamicEdges]);

    setTimeout(() => {
      fitView({ padding: 0.2, duration: 500 });
    }, 0);
  }, [pipelineData, spaces]);

  if (!pipelineData) return <div>Loading Campaign Pipeline Data...</div>;

  return (
    <div className="w-[130%] bg-white h-[100vh] relative">
      <button
        onClick={() => setShowDeleteModal(true)}
        className="absolute top-4 right-6 bg-red-600 text-white text-sm px-4 py-1 rounded shadow hover:bg-red-700 z-50"
      >
        Cleanup
      </button>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        zoomOnScroll={false}
        panOnScroll={false}
        fitView
      />

      {selectedNode && (
        <div style={modalStyle}>
          <div style={modalContentStyle} className="bg-white shadow-lg rounded-lg p-6 border">
            {selectedNode.id === 'booking' && <BookingStatusForm campaignId={CampaignId} onClose={() => setSelectedNode(null)} onConfirm={() => { setSelectedNode(null); triggerRefresh(); }} />}
            {selectedNode.id === 'po' && <POForm campaignId={CampaignId} onClose={() => setSelectedNode(null)} onConfirm={() => { setSelectedNode(null); triggerRefresh(); }} />}
            {selectedNode.id === 'artwork' && <ArtworkForm campaignId={CampaignId} onClose={() => setSelectedNode(null)} onConfirm={() => { setSelectedNode(null); triggerRefresh(); }} />}
            {selectedNode.id === 'invoice' && <InvoiceForm campaignId={CampaignId} onClose={() => setSelectedNode(null)} onConfirm={() => { setSelectedNode(null); triggerRefresh(); }} />}
            {selectedNode.id === 'payment' && <PaymentStatusForm campaignId={CampaignId} onClose={() => setSelectedNode(null)} onConfirm={() => { setSelectedNode(null); triggerRefresh(); }} />}
            {selectedNode.id.startsWith('print-') && <PrintingStatus campaignId={CampaignId} spaceId={selectedNode.id.split('-')[1]} onClose={() => setSelectedNode(null)} onConfirm={() => { setSelectedNode(null); triggerRefresh(); }} />}
            {selectedNode.id.startsWith('mount-') && <MountingStatus campaignId={CampaignId} spaceId={selectedNode.id.split('-')[1]} onClose={() => setSelectedNode(null)} onConfirm={() => { setSelectedNode(null); triggerRefresh(); }} />}
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div style={modalStyle}>
          <div style={{ ...modalContentStyle, width: '400px', height: '120px' }}>
            <h3 className="text-sm mx-auto font-semibold mb-4">Are you sure you want to delete this pipeline?</h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={async () => {
                  try {
                    await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/pipeline/campaign/${CampaignId}`);
                    setPipelineData(null);
                    setShowDeleteModal(false);
                    window.location.reload();
                  } catch (err) {
                    console.error('Failed to delete pipeline:', err);
                    toast.error('Error deleting pipeline');
                  }
                }}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CampaignPipelineWrapper(props) {
  return (
    <ReactFlowProvider>
      <CampaignPipelineInternal {...props} />
    </ReactFlowProvider>
  );
}

const modalStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  zIndex: 1000,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const modalContentStyle = {
  background: 'white',
  padding: '20px',
  borderRadius: '12px',
  display: 'inline-flex',
  flexDirection: 'column',
  maxHeight: '80vh',
  maxWidth: '90vw',
  overflowY: 'auto',
  boxSizing: 'border-box',
};


