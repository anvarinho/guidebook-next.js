type Props = {
    text: string,
    highlights: string[],
    name:string
};

const PlaceDescription = ({ text, highlights, name }: Props) => {
    let highlightedText = text;

    // Iterate through each highlight string
    highlights.forEach(highlight => {
        // Append "Bishkek" to the end of each highlight string
        const highlightWithCity = highlight;
        // Create a regular expression pattern for each highlight string
        const regex = new RegExp(`(${highlight})`, 'gi');
        // Replace each occurrence of the highlight string with the same string plus "Bishkek" wrapped in <strong> tags
        highlightedText = highlightedText.replace(regex, `<strong>${highlightWithCity}</strong>`);
    });

    return (
        <p dangerouslySetInnerHTML={{ __html: highlightedText }} />
    );
};

export default PlaceDescription;