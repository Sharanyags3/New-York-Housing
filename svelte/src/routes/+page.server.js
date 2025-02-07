export async function load({ fetch }) {
    try {
        const response = await fetch("http://127.0.0.1:8002/api/v1/get_data");
        
        // // Log that the data has been successfully fetched
        // console.log("Data fetched successfully.");

        // Check if the response status is OK
        if (!response.ok) {
            throw new Error(`Failed to fetch data. Status: ${response.status}`);
        }

        // Parse the JSON only once and store it in a variable
        const housingData = await response.json();

        // Log the fetched data to the console
        console.log("Fetched Housing data:", housingData);

        return {
            props:{
                Housing: housingData
            }
        };
    } catch (error) {
        // Log any errors that occurred during data fetching
        console.error("Error fetching data:", error);

        // You might want to throw the error again to handle it elsewhere in your application
        throw error;
    }
}