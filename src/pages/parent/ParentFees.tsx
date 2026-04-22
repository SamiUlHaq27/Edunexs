import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faFileInvoiceDollar, faCreditCard, faDownload, 
  faHistory, faCalendarAlt, faCheckCircle, faClock 
} from "@fortawesome/free-solid-svg-icons";

export default function ParentFees() {
  return (
    <div className="parent-fees-container hd-theme">
      <h3 className="card-title-hd">Fee & Invoices</h3>
      
      {/* 1. HD Summary Cards */}
      <div className="fees-grid-hd">
          <div className="fee-card-hd pending-border">
            <div className="fee-info-hd">
               <p className="fee-label">Current Due</p>
               <div className="fee-amount-hd text-danger">Rs 500.00</div>
               <p className="fee-date-hd"><FontAwesomeIcon icon={faClock} /> Due Date: 30 Nov 2025</p>
            </div>
            <button className="pay-now-btn-main">
               <FontAwesomeIcon icon={faCreditCard} /> <span>Pay Now</span>
            </button>
          </div>

          <div className="fee-card-hd paid-border">
            <div className="fee-info-hd">
               <p className="fee-label">Last Payment</p>
               <div className="fee-amount-hd text-success">Rs 450.00</div>
               <p className="fee-date-hd text-success"><FontAwesomeIcon icon={faCheckCircle} /> Paid on: 28 Oct 2025</p>
            </div>
            <div className="fee-icon-blob">
               <FontAwesomeIcon icon={faFileInvoiceDollar} />
            </div>
          </div>
      </div>

      {/* 2. Professional History Table */}
      <div className="history-card-hd">
          <div className="card-header-hd">
            <h4 className="table-title"><FontAwesomeIcon icon={faHistory} /> Payment History</h4>
            <span className="entries-count">3 Transactions Found</span>
          </div>
          
          <div className="table-responsive-hd">
            <table className="modern-data-table">
              <thead>
                  <tr>
                    <th>Invoice ID</th>
                    <th>Billing Month</th>
                    <th>Total Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
              </thead>
              <tbody>
                  <tr>
                    <td className="inv-id">#INV-2025-011</td>
                    <td>November 2025</td>
                    <td className="inv-amount">Rs 500.00</td>
                    <td><span className="status-pill warning-pill">Pending</span></td>
                    <td><button className="download-btn-hd"><FontAwesomeIcon icon={faDownload} /> PDF</button></td>
                  </tr>
                  <tr>
                    <td className="inv-id">#INV-2025-010</td>
                    <td>October 2025</td>
                    <td className="inv-amount">Rs 450.00</td>
                    <td><span className="status-pill active-pill">Paid</span></td>
                    <td><button className="download-btn-hd"><FontAwesomeIcon icon={faDownload} /> PDF</button></td>
                  </tr>
                  <tr>
                    <td className="inv-id">#INV-2025-009</td>
                    <td>September 2025</td>
                    <td className="inv-amount">Rs 450.00</td>
                    <td><span className="status-pill active-pill">Paid</span></td>
                    <td><button className="download-btn-hd"><FontAwesomeIcon icon={faDownload} /> PDF</button></td>
                  </tr>
              </tbody>
            </table>
          </div>
      </div>
    </div>
  );
}