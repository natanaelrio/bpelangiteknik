const getJakartaUnixTimestamp = () => {
    const date = new Date();
    // Jakarta is UTC+7
    const jakartaOffset = 7 * 60; // in minutes
    const localOffset = date.getTimezoneOffset(); // local timezone offset in minutes
    const jakartaTime = new Date(date.getTime() + (jakartaOffset + localOffset) * 60000);

    return jakartaTime.getTime(); // Return UNIX timestamp in milliseconds
};

// const ConvertToUnixTime = () => {
//     const [timestamp, setTimestamp] = useState('');

//     useEffect(() => {
//         const updateTimestamp = () => {
//             const unixTimestamp = getJakartaUnixTimestamp();
//             setTimestamp(unixTimestamp);
//         };

//         updateTimestamp();
//         const intervalId = setInterval(updateTimestamp, 1000); // Update every second

//         // Clean up interval on component unmount
//         return () => clearInterval(intervalId);
//     }, []);

//     return timestamp
// };

export default getJakartaUnixTimestamp;