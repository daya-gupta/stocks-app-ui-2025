export default function YoutubeVideo() {
    return (
        <div>
            <div id="player"></div>
            <h1>YouTube videos go here...</h1>
            <iframe width="560" height="315" src="https://www.youtube.com/embed/XUH-cYv4bS8?si=UToAwRb_-bWNIc9X" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
            <br />
            <iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/XUH-cYv4bS8?si=UToAwRb_-bWNIc9X" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
        </div>
    );
}
