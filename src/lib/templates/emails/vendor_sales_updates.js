const vendor_sales_html = (vendor) => {
    return `

        <div style="width: 100%">
            <h2>A new vendor has been registered, please verify below details.</h2>

            <table style="width: 100%">
                <tbody>
                    <tr>
                        <td>Name :</td>
                        <td>${vendor?.business_name}</td>
                    </tr>
                    <tr>
                        <td>Address :</td>
                        <td>${vendor?.vendor_address}</td>
                    </tr>
                    <tr>
                        <td>Country :</td>
                        <td>${vendor?.vendor_country === 'AU' ? 'Australia' : (vendor?.vendor_country === 'IN' ? 'India' : vendor?.vendor_country)}</td>
                    </tr>
                    <tr>
                        <td>Business ID :</td>
                        <td>${vendor?.business_abn}</td>
                    </tr>
                    <tr>
                        <td>Vendor Phone Number :</td>
                        <td>${vendor?.vendor_phone_number}</td>
                    </tr>
                    <tr>
                        <td>Vendor Email :</td>
                        <td>${vendor?.user_email}</td>
                    </tr>
                </tbody>
            </table>

            <h4>Documents to be verified</h4>
            <ul>
                ${
                    (vendor?.vendor_country === 'AU') ?
                    `
                        <li>Australian Business Number (ABN)</li>
                        <li>New Mobile Numbers</li>
                        <li>New Email Addresses</li>
                        <li>Bank Details</li>
                    ` : ''
                }

                ${
                    (vendor?.vendor_country === 'IN') ?
                    `
                        <li>GST Registration</li>
                        <li>PAN Card</li>
                        <li>Aadhar Card</li>
                        <li>New Email Addresses</li>
                        <li>Bank Details</li>
                    `: ''
                }
                
            </ul>
            <div>Note: please use following link to verify vendor after successfull document screening.</div>
            <div><a href="${vendor.verification_link}" rel="noopener noreferrer">Click here once all documents are verified</div>
        
        </div>

    
    `
}

module.exports = vendor_sales_html;