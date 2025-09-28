
export function createEmailTemplate(subject: string, body: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
        <style>
            body {
                font-family: 'Open Sans', sans-serif;
                color: #334155; /* slate-700 */
                line-height: 1.6;
                background-color: #f8fafc; /* slate-50 */
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                padding: 20px;
                border: 1px solid #e2e8f0; /* slate-200 */
                border-radius: 0.5rem;
                background-color: #ffffff;
            }
            .header {
                text-align: center;
                margin-bottom: 20px;
                padding-bottom: 20px;
                border-bottom: 1px solid #e2e8f0; /* slate-200 */
            }
            .header h1 {
                font-family: 'Montserrat', sans-serif;
                color: hsl(195, 100%, 40%); /* A bit darker than primary for text */
                font-size: 24px;
                margin: 0;
            }
            .content h2 {
                font-family: 'Montserrat', sans-serif;
                color: hsl(195, 100%, 40%);
                font-size: 20px;
            }
            .content p, .content ul, .content li, .content table {
                font-size: 16px;
            }
            .footer {
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #e2e8f0; /* slate-200 */
                font-size: 12px;
                color: #64748b; /* slate-500 */
                text-align: center;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>LUNA</h1>
            </div>
            <div class="content">
                <h2>${subject}</h2>
                ${body}
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Luna Industries Limited. All Rights Reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;
}
