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
        
        </div>

    
    `
}

module.exports = vendor_sales_html;