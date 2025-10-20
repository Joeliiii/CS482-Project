import React from 'react'

export default function Schedule() {
    return (
        <section>
            <h2 className="fw-bold text-ybt mb-4">Game Schedule</h2>
            <table className="table table-dark table-bordered align-middle">
                <thead>
                <tr className="text-ybt">
                    <th>Date</th>
                    <th>Time</th>
                    <th>Teams</th>
                    <th>Venue</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>Oct 21</td>
                    <td>4:00 PM</td>
                    <td>Hawks vs Bulls</td>
                    <td>Baltimore Arena</td>
                </tr>
                <tr>
                    <td>Oct 22</td>
                    <td>6:30 PM</td>
                    <td>Tigers vs Lions</td>
                    <td>Chicago Center</td>
                </tr>
                </tbody>
            </table>
        </section>
    )
}
