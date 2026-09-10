import React from 'react';

const Schedule = () => {
    return (
        <div>
            <h2 className="page-title mb-1">Schedule</h2>
            <p className="page-subtitle">Plan and view your upcoming posts on a calendar.</p>
            <div className="card shadow-sm mt-3">
                <div className="card-body text-center py-5">
                    <i className="bi bi-calendar3 fs-1 text-primary"></i>
                    <h5 className="mt-3">Content Calendar</h5>
                    <p className="text-muted mb-0">
                        Calendar view will be added in a later step.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Schedule;