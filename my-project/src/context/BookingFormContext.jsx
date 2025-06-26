  // src/context/BookingFormContext.jsx
  // import React, { createContext, useContext, useState } from 'react';

  // const BookingFormContext = createContext();

  // export const useBookingForm = () => useContext(BookingFormContext);

  // export const BookingFormProvider = ({ children }) => {
  //   const [basicInfo, setBasicInfo] = useState({
  //     companyName: '',
  //     clientName: '',
  //     clientEmail: '',
  //     clientContact: '',
  //     clientPan: '',
  //     clientGst: '',
  //     brandName: '',
  //     clientType: '',
  //     campaignImages: [],
  //   });
  //   const [proposalId, setProposalId] = useState(null);

  //   const [orderInfo, setOrderInfo] = useState({
  //     campaignName: '',
  //     industry: '',
  //     description: '',
  //   });
  //   const [bookingDates, setBookingDates] = useState({
  //     startDate: '',
  //     endDate: '',
  //   });
    

  //   const [selectedSpaces, setSelectedSpaces] = useState([]);
  //   const resetForm = () => {
  //     setBasicInfo({
  //       companyName: '',
  //       clientName: '',
  //       clientEmail: '',
  //       clientContact: '',
  //       clientPan: '',
  //       clientGst: '',
  //       brandName: '',
  //       clientType: '',
  //       campaignImages: [],
  //     });
  
  //     setOrderInfo({
  //       campaignName: '',
  //       industry: '',
  //       description: '',
  //     });
  
  //     setSelectedSpaces([]);
  //   };

  //   return (
  //     <BookingFormContext.Provider
  //       value={{
  //         basicInfo,
  //         setBasicInfo,
  //         orderInfo,
  //         setOrderInfo,
  //         selectedSpaces,
  //         setSelectedSpaces,
  //         bookingDates,
  //       setBookingDates,
  //       proposalId,
  //       setProposalId,
  //         resetForm
  //       }}
  //     >
  //       {children}
  //     </BookingFormContext.Provider>
  //   );
  // };


//   import React, { createContext, useContext, useState } from 'react';

// const BookingFormContext = createContext();

// export const useBookingForm = () => useContext(BookingFormContext);

// export const BookingFormProvider = ({ children }) => {
//   const [basicInfo, setBasicInfo] = useState({
//     companyName: '',
//     clientName: '',
//     clientEmail: '',
//     clientContact: '',
//     clientPan: '',
//     clientGst: '',
//     brandName: '',
//     clientType: '',
//     campaignImages: [],
//   });

//   const [orderInfo, setOrderInfo] = useState({
//     campaigns: [] // ✅ Multi-campaign support here
//   });

//   const [bookingDates, setBookingDates] = useState({
//     startDate: '',
//     endDate: '',
//   });

//   const [proposalId, setProposalId] = useState(null);

//   const resetForm = () => {
//     setBasicInfo({
//       companyName: '',
//       clientName: '',
//       clientEmail: '',
//       clientContact: '',
//       clientPan: '',
//       clientGst: '',
//       brandName: '',
//       clientType: '',
//       campaignImages: [],
//     });

//     setOrderInfo({ campaigns: [] });
//   };

//   return (
//     <BookingFormContext.Provider
//       value={{
//         basicInfo,
//         setBasicInfo,
//         orderInfo,
//         setOrderInfo,
//         bookingDates,
//         setBookingDates,
//         proposalId,
//         setProposalId,
//         resetForm,
//       }}
//     >
//       {children}
//     </BookingFormContext.Provider>
//   );
// };


import React, { createContext, useContext, useState, useMemo } from 'react';

const BookingFormContext = createContext();

export const useBookingForm = () => useContext(BookingFormContext);

export const BookingFormProvider = ({ children }) => {
  const [basicInfo, setBasicInfo] = useState({
    companyName: '',
    clientName: '',
    clientEmail: '',
    clientContact: '',
    clientPan: '',
    clientGst: '',
    brandName: '',
    clientType: '',
    bookingMode:'',
    bookingSource:'',
    isFOCBooking: false,
    campaignImages: [],
  });

  const [orderInfo, setOrderInfo] = useState({
    campaigns: [] // Multi-campaign data
  });

  const [bookingDates, setBookingDates] = useState({
    startDate: '',
    endDate: '',
  });

  const [proposalId, setProposalId] = useState(null);

  const resetForm = () => {
    setBasicInfo({
      companyName: '',
      clientName: '',
      clientEmail: '',
      clientContact: '',
      clientPan: '',
      clientGst: '',
      brandName: '',
      clientType: '',
      campaignImages: [],
      isFOCBooking: false,
    });

    setOrderInfo({ campaigns: [] });
    setProposalId(null);
  };

  // ✅ Flattened selectedSpaces from all saved campaigns
  const selectedSpaces = useMemo(() => {
    return orderInfo.campaigns
      .filter(c => c.isSaved)
      .flatMap(c => c.selectedSpaces || []);
  }, [orderInfo.campaigns]);

  return (
    <BookingFormContext.Provider
      value={{
        basicInfo,
        setBasicInfo,
        orderInfo,
        setOrderInfo,
        bookingDates,
        setBookingDates,
        proposalId,
        setProposalId,
        resetForm,
        selectedSpaces, // ✅ Derived selectedSpaces
      }}
    >
      {children}
    </BookingFormContext.Provider>
  );
};
