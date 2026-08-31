function loadDefaulters() {

    const year = document.getElementById("yearSelect").value;
    const table = document.getElementById("defaulterTable");

    if (year === "") {
        table.innerHTML = `
            <div class="result-empty">
                Select Year
            </div>
        `;
        return;
    }

    table.innerHTML = `
        <div class="result-empty">
            Loading Defaulter List...
        </div>
    `;

    fetch(`/teacher/defaulters/${year}`)
        .then(response => response.json())
        .then(data => {

            if (data.length === 0) {

                table.innerHTML = `
                    <div class="no-data">
                        <i class="fa-solid fa-circle-check"></i><br><br>
                        No Defaulters Found
                    </div>
                `;

                return;
            }

            let html = `
            <div class="table-wrap">

            <table>

            <thead>

            <tr>

            <th>#</th>
            <th>Student Name</th>
            <th>Year</th>
            <th>Roll No</th>
            <th>Phone No.</th>
            <th>Attendance</th>
            <th>Status</th>

            </tr>

            </thead>

            <tbody>
            `;

            data.forEach((student, index) => {

                html += `
                <tr>

                <td data-label="#">${index + 1}</td>

                <td data-label="Student Name">${student.name}</td>

                <td data-label="Year">${student.year}</td>

                <td data-label="Roll No">${student.roll}</td>

                <td data-label="Phone No.">${student.phone || "N/A"}</td>

                <td data-label="Attendance" class="percent-low">
                    ${student.percent}%
                </td>

                <td data-label="Status">
                    <span class="badge">
                        Defaulter
                    </span>
                </td>

                </tr>
                `;

            });

            html += `
            </tbody>

            </table>

            </div>
            `;

            table.innerHTML = html;

        })
        .catch(error => {

            console.error(error);

            table.innerHTML = `
                <div class="result-empty">
                    Unable to load defaulter list.
                </div>
            `;

        });

}