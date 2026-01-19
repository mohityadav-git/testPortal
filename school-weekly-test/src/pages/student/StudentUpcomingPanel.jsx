import React from "react";

function StudentUpcomingPanel({
  testsError,
  upcomingTests,
  isExpired,
  isNotStarted,
  onStartTest,
}) {
  return (
    <div className="card">
      <div className="section-header">
        <div>
          <div className="section-title">Upcoming Weekly Tests</div>
          <div className="section-sub">Scheduled tests</div>
        </div>
      </div>
      {testsError && <p className="section-sub" style={{ color: "#c23" }}>{testsError}</p>}
      {upcomingTests.length === 0 ? (
        <p>No upcoming tests.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Questions</th>
              <th>Date</th>
              <th>Time</th>
              <th>Duration</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {upcomingTests.map((test) => {
              const blocked = isExpired(test) || isNotStarted(test);
              const statusText = isExpired(test)
                ? "Closed"
                : isNotStarted(test)
                  ? "Not started"
                  : "Open";
              return (
                <tr key={test.id}>
                  <td>{test.subject}</td>
                  <td>{test.numQuestions || "-"}</td>
                  <td>{test.date}</td>
                  <td>{test.time}</td>
                  <td>{test.durationMinutes} min</td>
                  <td>{statusText}</td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => onStartTest(test.id)}
                      disabled={blocked}
                    >
                      Start Test
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default StudentUpcomingPanel;
