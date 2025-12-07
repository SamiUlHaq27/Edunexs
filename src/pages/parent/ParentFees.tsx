import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileInvoiceDollar, faCreditCard, faDownload } from "@fortawesome/free-solid-svg-icons";

export default function ParentFees() {
  return (
    <div>
      <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>Fee & Invoices</h3>
      
      <div className="dashboard-grid-modern" style={{ gridTemplateColumns: '1fr 1fr' }}>
         <div className="stat-card fee-card">
            <div>
               <p style={{ color: '#666', marginBottom: '0.25rem' }}>Current Due</p>
               <div className="fee-amount" style={{ color: '#dc2626' }}>Rs 500.00</div>
               <p style={{ fontSize: '0.8rem', color: '#dc2626' }}>Due Date: 30 Nov 2025</p>
            </div>
            <button className="btn btn-primary">
               <FontAwesomeIcon icon={faCreditCard} /> Pay Now
            </button>
         </div>

         <div className="stat-card fee-card paid">
            <div>
               <p style={{ color: '#666', marginBottom: '0.25rem' }}>Last Payment</p>
               <div className="fee-amount" style={{ color: '#059669' }}>Rs 450.00</div>
               <p style={{ fontSize: '0.8rem', color: '#059669' }}>Paid on: 28 Oct 2025</p>
            </div>
            <div style={{ color: '#059669', fontSize: '2rem' }}>
               <FontAwesomeIcon icon={faFileInvoiceDollar} />
            </div>
         </div>
      </div>

      <div className="card">
         <h4 className="card-title" style={{ marginBottom: '1rem' }}>Payment History</h4>
         <table className="data-table payment-history-table">
            <thead>
               <tr>
                  <th>Invoice ID</th>
                  <th>Month</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
               </tr>
            </thead>
            <tbody>
               <tr>
                  <td>#INV-2025-011</td>
                  <td>November 2025</td>
                  <td>Rs 500.00</td>
                  <td><span className="status-badge status-warning">Pending</span></td>
                  <td><button className="btn" style={{ padding: '4px 8px' }}><FontAwesomeIcon icon={faDownload} /> PDF</button></td>
               </tr>
               <tr>
                  <td>#INV-2025-010</td>
                  <td>October 2025</td>
                  <td>Rs 450.00</td>
                  <td><span className="status-badge status-active">Paid</span></td>
                  <td><button className="btn" style={{ padding: '4px 8px' }}><FontAwesomeIcon icon={faDownload} /> PDF</button></td>
               </tr>
               <tr>
                  <td>#INV-2025-009</td>
                  <td>September 2025</td>
                  <td>Rs 450.00</td>
                  <td><span className="status-badge status-active">Paid</span></td>
                  <td><button className="btn" style={{ padding: '4px 8px' }}><FontAwesomeIcon icon={faDownload} /> PDF</button></td>
               </tr>
            </tbody>
         </table>
      </div>
    </div>
  );
}