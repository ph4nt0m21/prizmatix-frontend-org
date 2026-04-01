// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import {
//   GetAllEmailCampaignsAPI,
//   DeleteEmailCampaignAPI
// } from '../../services/allApis';
// import { getUserData } from '../../utils/authUtil';
// import styles from './emailCampaignsListPage.module.scss';

// // --- SVG Icons as Components ---
// const IconSearch = () => (
//   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
// );
// const IconPerson = () => (
//   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
// );
// const IconAtSign = () => (
//   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"></path></svg>
// );
// const IconCalendar = () => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
// );
// const IconEye = () => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
// );
// const IconMoreHorizontal = () => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
// );
// const IconDuplicate = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>;
// const IconEdit = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
// const IconDelete = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;


// const EmailCampaignsListPage = () => {
//   const navigate = useNavigate();
//   const [campaigns, setCampaigns] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [deletingId, setDeletingId] = useState(null);
//   const [openMenuId, setOpenMenuId] = useState(null);
//   const menuRef = useRef(null);

//   const loadCampaigns = async () => {
//     setIsLoading(true);
//     try {
//       const userData = getUserData();
//       if (!userData?.organizationName) {
//         toast.error('Organization name not found. Please re-login.');
//         setIsLoading(false);
//         return;
//       }
//       const res = await GetAllEmailCampaignsAPI();
//       const allCampaigns = res.data || [];
//       const filtered = allCampaigns.filter(
//         (c) => c.organizationName === userData.organizationName
//       );
//       setCampaigns(filtered);
//     } catch (err) {
//       console.error('Failed to load campaigns', err);
//       toast.error('Failed to load campaigns');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadCampaigns();
//   }, []);

//   // Close menu on outside click
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (menuRef.current && !menuRef.current.contains(event.target)) {
//         setOpenMenuId(null);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);
  
//   const handleNewCampaign = () => navigate('/campaigns/new');
//   const handleEdit = (id) => navigate(`/campaigns/${id}/edit`);
//   const handleView = (id) => navigate(`/campaigns/${id}/edit?preview=true`);
  
// //   const handleDuplicate = (id) => {
// //     console.log("Duplicate campaign:", id);
// //     toast.info("Duplicate functionality coming soon!");
// //     setOpenMenuId(null);
// //   };

//   const handleDelete = async (id) => {
//     setOpenMenuId(null);
//     const confirmed = window.confirm('Are you sure you want to delete this campaign?');
//     if (!confirmed) return;

//     try {
//       setDeletingId(id);
//       await DeleteEmailCampaignAPI(id);
//       toast.success('Campaign deleted');
//       await loadCampaigns();
//     } catch (err) {
//       console.error('Delete failed', err);
//       toast.error('Failed to delete campaign');
//     } finally {
//       setDeletingId(null);
//     }
//   };

//   if (!isLoading && (!campaigns || campaigns.length === 0)) {
//     return (
//       <div className={styles.container}>
//         <div className={styles.headerRow}>
//             <div className={styles.left}>
//                 <h1>Email Campaigns</h1>
//                 <p className={styles.sub}>Use the Email Campaigns tool to send a bulk email to your attendees</p>
//             </div>
//         </div>
//         <div className={styles.emptyState}>
//           <h2>No Campaigns Found</h2>
//           <p>Get started by creating your first email campaign.</p>
//           <button className={styles.primaryButton} onClick={handleNewCampaign}>
//             + New Email Campaign
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={styles.container}>
//       <div className={styles.headerRow}>
//         <div className={styles.left}>
//           <h1>Email Campaigns</h1>
//           <p className={styles.sub}>
//             Use the Email Campaigns tool to send a bulk email to your attendees
//           </p>
//         </div>
//         <div className={styles.right}>
//             <div className={styles.searchBar}>
//                 <IconSearch />
//                 <input type="text" placeholder="Search" />
//             </div>
//           <button className={styles.primaryButton} onClick={handleNewCampaign}>
//             + New Email Campaign
//           </button>
//         </div>
//       </div>

//       <div className={styles.tableWrapper}>
//         <table className={styles.table}>
//           <thead>
//             <tr>
//               <th><span className={styles.headerIcon}></span> Campaign Title</th>
//               <th><span className={styles.headerIcon}></span> Subject</th>
//               <th><span className={styles.headerIcon}></span>Date</th>
//               <th style={{ width: 120 }}></th>
//             </tr>
//           </thead>
//           <tbody>
//             {isLoading ? (
//               <tr>
//                 <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>Loading campaigns...</td>
//               </tr>
//             ) : (
//               campaigns.map((c) => (
//                 <tr key={c.id}>
//                   <td className={styles.titleCell}>{c.campaignName || 'Untitled'}</td>
//                   <td className={styles.subjectCell}>{c.subject}</td>
//                   <td className={styles.dateCell}>
//                     {c.createdAt
//                       ? new Date(c.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
//                       : ''}
//                   </td>
//                   <td className={styles.actionsCell}>
//                     <div className={styles.actions}>
//                       {/* <button className={styles.iconButton} title="Preview" onClick={() => handleView(c.id)}>
//                         <IconEye />
//                       </button> */}
//                       <button className={styles.iconButton} title="More options" onClick={() => setOpenMenuId(openMenuId === c.id ? null : c.id)}>
//                         <IconMoreHorizontal />
//                       </button>

//                       {openMenuId === c.id && (
//                         <div className={styles.dropdownMenu} ref={menuRef}>
//                           {/* <button className={styles.dropdownItem} onClick={() => handleDuplicate(c.id)}>
//                             <IconDuplicate /> Duplicate
//                           </button> */}
//                           <button className={styles.dropdownItem} onClick={() => handleEdit(c.id)}>
//                             <IconEdit /> Edit
//                           </button>
//                           <button className={`${styles.dropdownItem} ${styles.deleteItem}`} onClick={() => handleDelete(c.id)} disabled={deletingId === c.id}>
//                             <IconDelete /> {deletingId === c.id ? 'Deleting...' : 'Delete'}
//                           </button>
//                         </div>
//                       )}
//                     </div>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       <div className={styles.footer}>
//         <div className={styles.rowsPerPage}>
//             <span>Rows per page:</span>
//             <select>
//                 <option value="10">10</option>
//                 <option value="25">25</option>
//                 <option value="50">50</option>
//             </select>
//         </div>
//         <div className={styles.pageInfo}>1–{campaigns?.length || 0} of {campaigns?.length || 0}</div>
//         <div className={styles.paginationActions}>
//             <button>&lt;</button>
//             <button>&gt;</button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EmailCampaignsListPage;


import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  GetAllEmailCampaignsAPI,
  DeleteEmailCampaignAPI
} from '../../services/allApis';
import { getUserData } from '../../utils/authUtil';
import styles from './emailCampaignsListPage.module.scss';

// --- SVG Icons as Components ---
const IconSearch = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);
const IconEye = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);
const IconMoreHorizontal = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
);
const IconDuplicate = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);
const IconEdit = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);
const IconDelete = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

const EmailCampaignsListPage = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  const loadCampaigns = async () => {
    setIsLoading(true);
    try {
      const userData = getUserData();
      if (!userData?.organizationName) {
        toast.error('Organization name not found. Please re-login.');
        setIsLoading(false);
        return;
      }
      const res = await GetAllEmailCampaignsAPI();
      const allCampaigns = res.data || [];
      const filtered = allCampaigns.filter(
        (c) => c.organizationName === userData.organizationName
      );
      setCampaigns(filtered);
    } catch (err) {
      console.error('Failed to load campaigns', err);
      toast.error('Failed to load campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNewCampaign = () => navigate('/campaigns/new');
  const handleEdit = (id) => navigate(`/campaigns/${id}/edit`);
  const handleView = (id) => navigate(`/campaigns/${id}/edit?preview=true`);

  // const handleDuplicate = (id) => {
  //   console.log("Duplicate campaign:", id);
  //   toast.info("Duplicate functionality coming soon!");
  //   setOpenMenuId(null);
  // };

  const handleDelete = async (id) => {
    setOpenMenuId(null);
    const confirmed = window.confirm('Are you sure you want to delete this campaign?');
    if (!confirmed) return;

    try {
      setDeletingId(id);
      await DeleteEmailCampaignAPI(id);
      toast.success('Campaign deleted');
      await loadCampaigns();
    } catch (err) {
      console.error('Delete failed', err);
      toast.error('Failed to delete campaign');
    } finally {
      setDeletingId(null);
    }
  };

  if (!isLoading && (!campaigns || campaigns.length === 0)) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.headerRow}>
            <div className={styles.left}>
              <h1>Email Campaigns</h1>
              <p className={styles.sub}>
                Use the Email Campaigns tool to send a bulk email to your attendees
              </p>
            </div>
          </div>

          <div className={styles.emptyState}>
            <h2>No Campaigns Found</h2>
            <p>Get started by creating your first email campaign.</p>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleNewCampaign}
            >
              + New Email Campaign
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.headerRow}>
          <div className={styles.left}>
            <h1>Email Campaigns</h1>
            <p className={styles.sub}>
              Use the Email Campaigns tool to send a bulk email to your attendees
            </p>
          </div>
          <div className={styles.right}>
            <div className={styles.searchBar}>
              <IconSearch />
              <input type="text" placeholder="Search" />
            </div>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleNewCampaign}
            >
              + New Email Campaign
            </button>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Campaign Title</th>
                <th>Subject</th>
                <th>Order Date</th>
                <th style={{ width: 60 }} />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>
                    Loading campaigns...
                  </td>
                </tr>
              ) : (
                campaigns.map((c) => (
                  <tr key={c.id}>
                    <td className={styles.titleCell}>{c.campaignName || 'Untitled'}</td>
                    <td className={styles.subjectCell}>{c.subject}</td>
                    <td className={styles.dateCell}>
                      {c.createdAt
                        ? new Date(c.createdAt).toLocaleString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })
                        : ''}
                    </td>
                    <td className={styles.actionsCell}>
                      <div className={styles.actions}>
                        {/* Eye icon if you want preview button visible */}
                        <button
                          type="button"
                          className={styles.iconButton}
                          title="Preview"
                          onClick={() => handleView(c.id)}
                        >
                          <IconEye />
                        </button>
                        <button
                          type="button"
                          className={styles.iconButton}
                          title="More options"
                          onClick={() =>
                            setOpenMenuId(openMenuId === c.id ? null : c.id)
                          }
                        >
                          <IconMoreHorizontal />
                        </button>

                        {openMenuId === c.id && (
                          <div className={styles.dropdownMenu} ref={menuRef}>
                            {/* <button
                              type="button"
                              className={styles.dropdownItem}
                              onClick={() => handleDuplicate(c.id)}
                            >
                              <IconDuplicate /> Duplicate
                            </button> */}
                            <button
                              type="button"
                              className={styles.dropdownItem}
                              onClick={() => handleEdit(c.id)}
                            >
                              <IconEdit /> Edit
                            </button>
                            <button
                              type="button"
                              className={`${styles.dropdownItem} ${styles.deleteItem}`}
                              onClick={() => handleDelete(c.id)}
                              disabled={deletingId === c.id}
                            >
                              <IconDelete />{' '}
                              {deletingId === c.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.footer}>
          <div className={styles.rowsPerPage}>
            <span>Rows per page:</span>
            <select defaultValue="10">
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>
          <div className={styles.pageInfo}>
            1–{campaigns?.length || 0} of {campaigns?.length || 0}
          </div>
          <div className={styles.paginationActions}>
            <button type="button">&lt;</button>
            <button type="button">&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailCampaignsListPage;
