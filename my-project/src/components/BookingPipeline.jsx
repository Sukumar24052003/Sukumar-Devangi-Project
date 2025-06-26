

import React, { useCallback, useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
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

// Styling for nodes
const baseNodeStyle = {
  padding: 10,
  border: '2px solid',
  borderRadius: 8,
  fontWeight: 600,
};

const initialNodes = [
  { id: '1', position: { x: 0, y: 200 }, data: { label: 'Booking Confirmed' }, style: { ...baseNodeStyle, background: '#d1fae5', borderColor: '#10b981' }, sourcePosition: 'right', targetPosition: 'left' },
  { id: '2', position: { x: 250, y: 200 }, data: { label: 'PO status' }, style: { ...baseNodeStyle, background: '#bfdbfe', borderColor: '#3b82f6' }, sourcePosition: 'right', targetPosition: 'left' },
  { id: '6', position: { x: 500, y: 150 }, data: { label: 'Artwork status' }, style: { ...baseNodeStyle, background: '#fbcfe8', borderColor: '#ec4899' }, sourcePosition: 'right', targetPosition: 'left' },
  { id: '4', position: { x: 500, y: 300 }, data: { label: 'Invoice Details' }, style: { ...baseNodeStyle, background: '#fef3c7', borderColor: '#facc15' }, sourcePosition: 'right', targetPosition: 'left' },
  { id: '5', position: { x: 750, y: 300 }, data: { label: 'Payment status' }, style: { ...baseNodeStyle, background: '#ede9fe', borderColor: '#8b5cf6' }, sourcePosition: 'right', targetPosition: 'left' },
  { id: '7', position: { x: 750, y: 150 }, data: { label: 'Printing Status' }, style: { ...baseNodeStyle, background: '#bfdbfe', borderColor: '#3b82f6' }, sourcePosition: 'right', targetPosition: 'left' },
  { id: '8', position: { x: 1000, y: 200 }, data: { label: 'Mounting Status' }, style: { ...baseNodeStyle, background: '#fecaca', borderColor: '#ef4444' }, sourcePosition: 'right', targetPosition: 'left' },
  { id: '9', position: { x: 1250, y: 200 }, data: { label: 'Advertising Live' }, style: { ...baseNodeStyle, background: '#d9f99d', borderColor: '#84cc16' }, sourcePosition: 'right', targetPosition: 'left' },
];





const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', type: 'straight', markerEnd: 'arrowclosed' },
  { id: 'e2-6', source: '2', target: '6', type: 'straight', markerEnd: 'arrowclosed' },
  { id: 'e2-4', source: '2', target: '4', label: 'Yes', type: 'straight', markerEnd: 'arrowclosed' },
  { id: 'e4-5', source: '4', target: '5', type: 'straight', markerEnd: 'arrowclosed' },
  { id: 'e6-7', source: '6', target: '7', type: 'straight', markerEnd: 'arrowclosed' },
  { id: 'e7-8', source: '7', target: '8', type: 'straight', markerEnd: 'arrowclosed' },
  { id: 'e8-9', source: '8', target: '9', type: 'straight', markerEnd: 'arrowclosed' },
];

export default function BookingFlow({ bookingId }) {
  const { id } = useParams();
  const BookingId = bookingId || id;

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);
  const { pipelineData, setPipelineData } = useContext(PipelineContext);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { fitView ,setViewport} = useReactFlow();

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);
  const onNodeClick = (_, node) => setSelectedNode(node);
  console.log('BookingId:', BookingId);
  console.log('PipelineData:', pipelineData);

  useEffect(() => {
    const fetchOrCreatePipeline = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/pipeline/${BookingId}`);
        setPipelineData(res.data);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          const createRes = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/pipeline/${BookingId}`);
          setPipelineData(createRes.data);
        } else {
          console.error('Error fetching/creating pipeline:', err);
        }
      }
    };

    if (BookingId) {
      fetchOrCreatePipeline();
    }
  }, [BookingId]);


// useEffect(() => {
//   if (nodes.length > 0 && pipelineData) {
//     fitView({ padding: 0.15, duration: 400 });
//   }
// }, [nodes, pipelineData, fitView]);

useEffect(() => {
  if (nodes.length > 0 && pipelineData) {
    // Step 1: Fit the pipeline nicely into the view
    fitView({ padding: 0.2, duration: 300 });

    // Step 2: Wait a bit, then zoom out
    setTimeout(() => {
      setViewport({ x: 0, y: 0, zoom: 0.6, duration: 300 });
    }, 350); // 350ms gives fitView time to complete
  }
}, [nodes, pipelineData]);




  if (!pipelineData || typeof pipelineData !== 'object') {
    return <div>Loading Pipeline Data...</div>;
  }
  

  const filteredNodes = nodes.filter((node) => {
    if (node.id === '1') return true;
    if (!pipelineData?.bookingStatus?.confirmed) return false;
    if (['2', '6'].includes(node.id)) return true;
    if (['4', '5'].includes(node.id)) return pipelineData.po?.confirmed;
    if (['7'].includes(node.id)) return pipelineData.artwork?.confirmed;
    if (['8'].includes(node.id)) return pipelineData.printingStatus?.confirmed;
    if (['9'].includes(node.id)) return pipelineData.mountingStatus?.confirmed;
    return true;
  });

  const filteredEdges = edges
    .filter(edge => {
      if (['e1-2', 'e2-6', 'e2-4'].includes(edge.id)) return pipelineData?.bookingStatus?.confirmed;
      if (edge.id === 'e4-5') return pipelineData.po?.confirmed;
      if (edge.id === 'e6-7') return pipelineData.artwork?.confirmed;
      if (edge.id === 'e7-8') return pipelineData.printingStatus?.confirmed;
      if (edge.id === 'e8-9') return pipelineData.mountingStatus?.confirmed;
      return true;
    })
    .map(edge => {
      if (edge.id === 'e1-2' && pipelineData?.bookingStatus?.confirmed) return { ...edge, label: 'Confirmed' };
      if (edge.id === 'e6-7' && pipelineData?.artwork?.confirmed) return { ...edge, label: 'Received' };
      if (edge.id === 'e7-8' && pipelineData?.printingStatus?.confirmed) return { ...edge, label: 'Done' };
      if (edge.id === 'e8-9' && pipelineData?.printingStatus?.confirmed) return { ...edge, label: 'Done' };
      if (edge.id === 'e4-5' && pipelineData?.invoice?.invoiceNumber) return { ...edge, label: 'Received' };
      return edge;
    });

  return (
    <div style={{ height: '130vh', width: '100vw' }}>
      <button
        onClick={() => setShowDeleteModal(true)}
        className="absolute top-4 right-6 bg-red-600 text-white text-sm px-4 py-1 rounded shadow hover:bg-red-700 z-50"
      >
        Delete Pipeline
      </button>

      <ReactFlow
        nodes={filteredNodes}
        edges={filteredEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        fitView
        zoomOnScroll={false}
        panOnScroll={false}
      />

      {selectedNode && (
        <div style={modalStyle}>

<div style={modalContentStyle} className='bg-white shadow-lg rounded-lg p-6 border'>
  <div>
    {selectedNode.id === '1' && <BookingStatusForm bookingId={BookingId} onConfirm={() => { setSelectedNode(null); fitView(); }} />}
    {selectedNode.id === '2' && <POForm bookingId={BookingId} onConfirm={() => { setSelectedNode(null); fitView(); }} />}
    {selectedNode.id === '6' && <ArtworkForm bookingId={BookingId} onConfirm={() => { setSelectedNode(null); fitView(); }} />}
    {selectedNode.id === '4' && <InvoiceForm bookingId={BookingId} onConfirm={() => { setSelectedNode(null); fitView(); }} />}
    {selectedNode.id === '5' && <PaymentStatusForm bookingId={BookingId} onConfirm={() => { setSelectedNode(null); fitView(); }} />}
    {selectedNode.id === '7' && <PrintingStatus bookingId={BookingId} onConfirm={() => { setSelectedNode(null); fitView(); }} />}
    {selectedNode.id === '8' && <MountingStatus bookingId={BookingId} onConfirm={() => { setSelectedNode(null); fitView(); }} />}
  </div>

  <div className="mt-4 justify-center flex">
    <button
      className="w-[1/10]  bg-gray-200 py-2 rounded hover:bg-gray-300 text-sm"
      onClick={() => setSelectedNode(null)}
    >
      Close
    </button>
  </div>
</div>


        </div>
      )}

      {showDeleteModal && (
        <div style={modalStyle}>
          <div style={{ ...modalContentStyle, width: '400px', height: '200px' }}>
            <h3 className="text-xl font-semibold mb-4">Are you sure you want to delete this pipeline?</h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={async () => {
                  try {
                    await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/pipeline/${BookingId}`);
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

// Simple modal styles
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
  display: 'inline-flex',    // dynamic width & height
  flexDirection: 'column',
  maxHeight: '80vh',         // safe upper limit
  maxWidth: '90vw',          // safe upper limit
  overflowY: 'auto',         // scroll inside modal if too big
  boxSizing: 'border-box',
};





