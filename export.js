document.addEventListener('DOMContentLoaded', () => {
    // Load the XLSX library dynamically
    function loadScript(url, callback) {
        const script = document.createElement('script');
        script.src = url;
        script.onload = callback;
        document.head.appendChild(script);
    }

    loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js', () => {
        console.log('XLSX library loaded');

        const downloadBtn = document.getElementById('download-btn');

        downloadBtn.addEventListener('click', () => {
            // Check if the XLSX library is loaded
            if (!window.XLSX) {
                console.error('XLSX library not loaded');
                return;
            }

            // Create a new workbook
            const wb = XLSX.utils.book_new();

            // Get table data
            const table = document.querySelector('table');
            const rows = Array.from(table.querySelectorAll('tr'));

            // Create a new array to hold table data without the Actions column
            const dataWithoutActions = rows.map(row => {
                const cells = Array.from(row.querySelectorAll('td, th'));
                // Remove the last cell (Actions column) if it exists
                cells.pop();
                return cells.map(cell => cell.textContent.trim());
            });

            // Calculate Grand Total
            const grandTotalElement = document.getElementById('grand-total');
            const grandTotal = grandTotalElement ? grandTotalElement.textContent.trim() : '$0.00';

            // Create a worksheet from the processed data
            const ws = XLSX.utils.aoa_to_sheet(dataWithoutActions);

            // Set column widths
            ws['!cols'] = [
                { width: 30 }, // Adjust width for the Name column
                { width: 15 }, // Adjust width for the Price column
                { width: 10 }, // Adjust width for the Quantity column
                { width: 15 }  // Adjust width for the Total column
            ];

            // Add "Grand Total" row to the worksheet
            const totalRowIndex = dataWithoutActions.length + 1; // Add one for the grand total row

            ws[`A${totalRowIndex + 1}`] = {
                v: 'Grand Total:',
                s: {
                    font: { bold: true, sz: 14 } // Bold and larger font size
                }
            };

            ws[`D${totalRowIndex + 1}`] = {
                v: grandTotal, // Grand total number
                s: {
                    font: { bold: true, sz: 16 } // Larger font size for grand total number
                }
            };

            // Append the sheet to the workbook
            XLSX.utils.book_append_sheet(wb, ws, 'Products');

            // Generate binary data and create a blob
            const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
            const buf = new ArrayBuffer(wbout.length);
            const view = new Uint8Array(buf);
            for (let i = 0; i < wbout.length; i++) view[i] = wbout.charCodeAt(i) & 0xFF;
            const blob = new Blob([buf], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);

            // Create a download link and trigger the download
            const a = document.createElement('a');
            a.href = url;
            a.download = 'company_inventory.xlsx';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url); // Clean up the URL object
        });
    });
});
