import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faSearch, faFilter, faPlus, faFileInvoiceDollar, 
  faCheckCircle, faClock, faExclamationCircle, faTimes, 
  faEllipsisV, faTrash, faEdit, faCheck
} from "@fortawesome/free-solid-svg-icons";
import "../../styles/owner.css";

// --- Interfaces ---
interface FeeRecord {
  id: string;
  studentName: string;
  rollNo: string;
  amount: number;
  description: string;
  dueDate: string;
  status: "Paid" | "Pending" | "Overdue";
}

export default function FeeManagement() {
  // --- Mock Data ---
  const [fees, setFees] = useState<FeeRecord[]>([
    { id: "INV-2026-001", studentName: "Ahmad Raza", rollNo: "STD-001", amount: 15000, description: "Tuition Fee - Spring 2026", dueDate: "2026-03-15", status: "Paid" },
    { id: "INV-2026-002", studentName: "Sara Ahmed", rollNo: "STD-002", amount: 15000, description: "Tuition Fee - Spring 2026", dueDate: "2026-03-15", status: "Pending" },
    { id: "INV-2026-003", studentName: "Ali Khan", rollNo: "STD-003", amount: 18000, description: "Tuition + Lab Fee", dueDate: "2026-02-28", status: "Overdue" },
    { id: "INV-2026-004", studentName: "Zainab Bibi", rollNo: "STD-004", amount: 5000, description: "Transport Fee", dueDate: "2026-03-10", status: "Paid" },
  ]);

  // --- UI State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | "Paid" | "Pending" | "Overdue">("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // --- Modal State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feeForm, setFeeForm] = useState<FeeRecord>({
    id: "", studentName: "", rollNo: "", amount: 0, description: "", dueDate: "", status: "Pending"
  });

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
      setIsFilterOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // --- Helpers ---
  const filteredFees = fees.filter(fee => {
    const matchesSearch = fee.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          fee.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          fee.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "All" || fee.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "Paid": 
        return <span style={{ background: '#d1fae5', color: '#065f46', padding: '0.25rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><FontAwesomeIcon icon={faCheckCircle} /> Paid</span>;
      case "Pending": 
        return <span style={{ background: '#fef3c7', color: '#92400e', padding: '0.25rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><FontAwesomeIcon icon={faClock} /> Pending</span>;
      case "Overdue": 
        return <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.25rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><FontAwesomeIcon icon={faExclamationCircle} /> Overdue</span>;
      default: return null;
    }
  };

  const toggleFilter = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(null);
    setIsFilterOpen(!isFilterOpen);
  };

  // --- Handlers ---
  const handleOpenModal = (fee?: FeeRecord) => {
    if (fee) {
      setFeeForm({ ...fee });
    } else {
      setFeeForm({ id: "", studentName: "", rollNo: "", amount: 0, description: "", dueDate: "", status: "Pending" });
    }
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleSaveFee = (e: React.FormEvent) => {
    e.preventDefault();
    if (feeForm.id) {
      // Edit existing
      setFees(fees.map(f => f.id === feeForm.id ? feeForm : f));
    } else {
      // Create new
      const newFee: FeeRecord = {
        ...feeForm,
        id: `INV-${new Date().getFullYear()}-00${fees.length + 1}`
      };
      setFees([newFee, ...fees]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteFee = (id: string) => {
    if (window.confirm("Are you sure you want to delete this invoice record?")) {
      setFees(fees.filter(f => f.id !== id));
    }
    setOpenMenuId(null);
  };

  const toggleFeeStatus = (id: string, currentStatus: string) => {
    let newStatus: "Paid" | "Pending" | "Overdue" = "Paid";
    if (currentStatus === "Pending") newStatus = "Paid";
    else if (currentStatus === "Paid") newStatus = "Overdue";
    else if (currentStatus === "Overdue") newStatus = "Pending";
    
    setFees(fees.map(f => f.id === id ? { ...f, status: newStatus } : f));
    setOpenMenuId(null);
  };

  return (
    <div className="admin-page-container">
      
      {/* --- Premium Header Area --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#111827', margin: 0, letterSpacing: '-0.025em' }}>
            Fee & Invoice Management
          </h2>
          <p style={{ margin: '0.4rem 0 0 0', color: '#6b7280', fontSize: '1rem', fontWeight: '500' }}>
            Generate student invoices, track payments, and monitor overdue accounts.
          </p>
        </div>
        <button 
          className="btn btn-primary" 
          style={{ 
            backgroundColor: '#10b981', // Emerald green for finance
            height: '46px', 
            padding: '0 1.5rem', 
            borderRadius: '8px',
            fontSize: '0.95rem',
            fontWeight: '600',
            boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3), 0 2px 4px -1px rgba(16, 185, 129, 0.2)',
            transition: 'all 0.2s ease-in-out'
          }} 
          onClick={() => handleOpenModal()}
        >
          <FontAwesomeIcon icon={faPlus} style={{ marginRight: '0.5rem' }} /> Generate Invoice
        </button>
      </div>

      {/* --- Main Data Card --- */}
      <div className="card" style={{ padding: '1.5rem', minHeight: '500px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        
        {/* Toolbar: Search & Filter */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          
          <div className="input-with-icon" style={{ margin: 0, width: '350px' }}>
            <span className="input-icon"><FontAwesomeIcon icon={faSearch} color="#9ca3af" /></span>
            <input 
              className="auth-input" 
              placeholder="Search by student name, roll no, or invoice ID..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              style={{ height: '42px', fontSize: '0.9rem', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }} 
            />
          </div>

          <div style={{ position: 'relative' }}>
            <button 
              className="btn" 
              style={{ 
                height: '42px', background: filterStatus !== 'All' ? '#ecfdf5' : '#fff', 
                color: filterStatus !== 'All' ? '#059669' : '#4b5563',
                border: filterStatus !== 'All' ? '1px solid #a7f3d0' : '1px solid #d1d5db', 
                display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: '600' 
              }}
              onClick={toggleFilter}
            >
              <FontAwesomeIcon icon={faFilter} /> {filterStatus === "All" ? "All Statuses" : filterStatus} 
            </button>
            
            {isFilterOpen && (
              <div className="filter-dropdown" style={{ top: '48px', right: 0, width: '180px', borderRadius: '8px', overflow: 'hidden' }}>
                {['All', 'Paid', 'Pending', 'Overdue'].map((status) => (
                  <button 
                    key={status} 
                    className="dropdown-item" 
                    onClick={() => { setFilterStatus(status as any); setIsFilterOpen(false); }}
                    style={{ justifyContent: 'space-between', padding: '0.6rem 1rem', background: filterStatus === status ? '#f3f4f6' : 'white', fontWeight: filterStatus === status ? '600' : '400' }}
                  >
                    {status}
                    {filterStatus === status && <FontAwesomeIcon icon={faCheck} style={{ color: '#10b981' }} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Financial Table */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <th>Invoice ID</th>
                <th>Student Details</th>
                <th>Fee Description</th>
                <th>Due Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFees.length > 0 ? filteredFees.map(fee => (
                <tr key={fee.id} style={{ transition: 'background-color 0.2s' }}>
                  <td style={{ fontWeight: '700', color: '#4f46e5', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                    {fee.id}
                  </td>
                  <td>
                    <div style={{ fontWeight: '600', color: '#111827' }}>{fee.studentName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'monospace' }}>{fee.rollNo}</div>
                  </td>
                  <td style={{ color: '#4b5563', fontSize: '0.9rem' }}>
                    {fee.description}
                  </td>
                  <td style={{ color: '#4b5563', fontSize: '0.9rem', fontWeight: '500' }}>
                    {fee.dueDate}
                  </td>
                  <td style={{ fontWeight: '700', color: '#111827', fontSize: '1rem' }}>
                    Rs. {fee.amount.toLocaleString()}
                  </td>
                  <td>
                    {getStatusBadge(fee.status)}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div className="action-btn-wrapper" style={{ display: 'inline-block' }}>
                      <button 
                        className="btn action-btn" 
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === fee.id ? null : fee.id); }}
                        style={{ padding: '0.4rem', color: '#9ca3af' }}
                      >
                        <FontAwesomeIcon icon={faEllipsisV} />
                      </button>
                      {openMenuId === fee.id && (
                        <div className="action-menu-dropdown" style={{ right: '0', top: '100%', minWidth: '160px' }}>
                          <button className="dropdown-item" onClick={() => handleOpenModal(fee)}>
                            <FontAwesomeIcon icon={faEdit} fixedWidth style={{ color: '#4b5563' }} /> Edit Details
                          </button>
                          <button className="dropdown-item" onClick={() => toggleFeeStatus(fee.id, fee.status)}>
                            <FontAwesomeIcon icon={faCheckCircle} fixedWidth style={{ color: '#10b981' }} /> Update Status
                          </button>
                          <div style={{ height: '1px', background: '#e5e7eb', margin: '0.25rem 0' }}></div>
                          <button className="dropdown-item danger" onClick={() => handleDeleteFee(fee.id)}>
                            <FontAwesomeIcon icon={faTrash} fixedWidth /> Delete Invoice
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '4rem 1rem', color: '#6b7280' }}>
                    <FontAwesomeIcon icon={faFileInvoiceDollar} size="3x" style={{ marginBottom: '1rem', color: '#d1d5db' }} />
                    <p style={{ fontSize: '1.1rem', fontWeight: '500', color: '#374151' }}>No invoices found.</p>
                    <p style={{ fontSize: '0.9rem' }}>Try adjusting your search filters or generate a new invoice.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL: GENERATE / EDIT INVOICE --- */}
      {isModalOpen && (
        <div className="owner-modal-overlay" style={{ backdropFilter: 'blur(4px)' }}>
          <div className="owner-modal" style={{ width: '600px', borderRadius: '12px', overflow: 'hidden' }}>
            
            <div className="owner-modal-header" style={{ padding: '1.5rem', background: 'white', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', background: '#d1fae5', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FontAwesomeIcon icon={faFileInvoiceDollar} style={{ color: '#059669', fontSize: '1.2rem' }} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#111827' }}>
                    {feeForm.id ? "Edit Invoice Details" : "Generate Student Invoice"}
                  </h3>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#6b7280' }}>Fill out the billing details below.</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <FontAwesomeIcon icon={faTimes} size="lg" color="#9ca3af" />
              </button>
            </div>
            
            <form onSubmit={handleSaveFee}>
              <div className="owner-modal-body" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', background: '#f9fafb' }}>
                
                {/* Grid: Student Details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <label className="auth-label" style={{ fontWeight: '600', color: '#374151' }}>Student Name</label>
                    <input 
                      className="auth-input" required value={feeForm.studentName} onChange={e => setFeeForm({...feeForm, studentName: e.target.value})} 
                      placeholder="e.g. Ahmad Raza" style={{ marginTop: '0.5rem', height: '42px', border: '1px solid #d1d5db', borderRadius: '6px' }} 
                    />
                  </div>

                  <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <label className="auth-label" style={{ fontWeight: '600', color: '#374151' }}>Roll Number</label>
                    <input 
                      className="auth-input" required value={feeForm.rollNo} onChange={e => setFeeForm({...feeForm, rollNo: e.target.value})} 
                      placeholder="e.g. STD-001" style={{ marginTop: '0.5rem', height: '42px', border: '1px solid #d1d5db', borderRadius: '6px' }} 
                    />
                  </div>
                </div>

                {/* Description */}
                <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <label className="auth-label" style={{ fontWeight: '600', color: '#374151' }}>Fee Description / Title</label>
                  <input 
                    className="auth-input" required value={feeForm.description} onChange={e => setFeeForm({...feeForm, description: e.target.value})} 
                    placeholder="e.g. Tuition Fee - Spring 2026" style={{ marginTop: '0.5rem', height: '42px', border: '1px solid #d1d5db', borderRadius: '6px' }} 
                  />
                </div>

                {/* Grid: Amount, Date, Status */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <label className="auth-label" style={{ fontWeight: '600', color: '#374151' }}>Amount (Rs.)</label>
                    <input 
                      type="number" min="0" className="auth-input" required value={feeForm.amount || ""} onChange={e => setFeeForm({...feeForm, amount: parseInt(e.target.value) || 0})} 
                      placeholder="0" style={{ marginTop: '0.5rem', height: '42px', border: '1px solid #d1d5db', borderRadius: '6px' }} 
                    />
                  </div>

                  <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <label className="auth-label" style={{ fontWeight: '600', color: '#374151' }}>Due Date</label>
                    <input 
                      type="date" className="auth-input" required value={feeForm.dueDate} onChange={e => setFeeForm({...feeForm, dueDate: e.target.value})} 
                      style={{ marginTop: '0.5rem', height: '42px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: 'white' }} 
                    />
                  </div>

                  <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <label className="auth-label" style={{ fontWeight: '600', color: '#374151' }}>Status</label>
                    <select 
                      className="auth-input" value={feeForm.status} onChange={e => setFeeForm({...feeForm, status: e.target.value as any})} 
                      style={{ marginTop: '0.5rem', height: '42px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: 'white' }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="owner-modal-footer" style={{ padding: '1.25rem 1.5rem', background: 'white', borderTop: '1px solid #f3f4f6', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn" onClick={() => setIsModalOpen(false)} style={{ background: 'white', border: '1px solid #d1d5db', color: '#374151', fontWeight: '600' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#10b981', fontWeight: '600' }}>
                  {feeForm.id ? "Save Changes" : "Generate Invoice"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}