import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Fixed 3 utilities — always visible with correct icons
const UTILITIES = [
  { id: 1, name: 'Electricity', icon: '⚡', type: 'electricity' },
  { id: 2, name: 'Water',       icon: '💧',   type: 'water' },
  { id: 3, name: 'Gas',         icon: '🔥',      type: 'gas' },
];

function HomePage() {
  const [userData, setUserData] = useState({ username: 'Suresh' });
  const [bills, setBills] = useState([]);
  const [totalDue, setTotalDue] = useState(0);
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, billsRes, remindersRes] = await Promise.all([
          axios.get('http://localhost:8000/user'),
          axios.get('http://localhost:8000/bills'),
          axios.get('http://localhost:8000/reminders'),
        ]);

        setUserData(userRes.data || { username: 'Suresh' });
        const realBills = billsRes.data || [];
        setBills(realBills);

        const total = realBills.reduce((sum, b) => sum + (b.amount || 0), 0);
        setTotalDue(total);

        setReminders(remindersRes.data || []);
      } catch (error) {
        console.log('API error → showing default view', error);
      }
    };

    fetchData();
  }, []);

  // Find matching bill for a utility
  const getBillFor = (utility) => {
    return bills.find(b => {
      const name = (b.utility_name || b.provider || b.type || '').toLowerCase();
      return name.includes(utility.type) || name.includes(utility.name.toLowerCase());
    });
  };

  const daysUntil = (date) => {
    if (!date) return null;
    const diff = new Date(date) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="homepage-container">
      <header className="welcome-header">
        <h1>Welcome back, {userData.username || 'Suresh'}. It's great to have you back !!!</h1>
        <p>Pay your bills quickly and earn cashback rewards!</p>
      </header>
  
      <div className="main-layout">
        <div className="utilities-grid">
          {UTILITIES.map((util) => {
            const bill = getBillFor(util);
            const amount = bill?.amount || 0;
            const dueDate = bill?.due_date;
            const daysLeft = dueDate ? daysUntil(dueDate) : null;
  
            return (
              <div key={util.id} className="utility-card">
                <div className="card-header">
                  <span className="icon">{util.icon}</span>
                  <h3>{util.name}</h3>
                </div>
  
                <div className="amount-section">
                  <div className={`amount ${amount === 0 ? 'zero' : ''}`}>
                    Rs. {Number(amount).toFixed(2)}
                  </div>
                  <div className={`due-text ${daysLeft < 0 ? 'overdue' : ''}`}>
                    {dueDate 
                      ? (daysLeft > 0 ? `Due in ${daysLeft} day${daysLeft > 1 ? 's' : ''}` 
                        : daysLeft === 0 ? 'Due today' : 'Overdue')
                      : 'No bill this month'}
                  </div>
                </div>
  
                <div className="cashback-info">
                  <span>1000+ users received cashback</span>
                </div>
              </div>
            );
          })}
        </div>
  
        <aside className="sidebar">
          <div className="total-due-card">
            <h3>Total Amount Due</h3>
            <div className={`total-amount ${totalDue === 0 ? 'zero' : ''}`}>
              Rs. {totalDue.toFixed(2)}
            </div>
            <button className="pay-all-btn" disabled={totalDue === 0}>
              {totalDue > 0 ? 'Make Payment' : 'All Paid Up'}
            </button>
          </div>
  
          <div className="reminders-card">
            <h3>Upcoming Reminders</h3>
            {reminders.length === 0 ? (
              <p className="no-reminders">No urgent reminders</p>
            ) : (
              reminders.map((r, i) => (
                <div key={i} className="reminder-item">
                  <span>Bell</span>
                  <p>{r.message}</p>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

export default HomePage;