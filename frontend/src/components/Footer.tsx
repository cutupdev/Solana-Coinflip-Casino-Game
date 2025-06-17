import { DiscordIcon, HomeIcon, MEIcon, TwitterIcon } from "./svgIcons";

export default function Footer() {
  return (
    <footer>
      <ul>
        <li>
          <a href="https://deezkits.com" rel="noreferrer">
            <HomeIcon /> Home
          </a>
        </li>
        <li>
          <a
            href="https://magiceden.io/marketplace/deez_kits"
            target="_blank"
            rel="noreferrer"
          >
            <MEIcon /> magic eden
          </a>
        </li>
        <li>
          <a
            href="https://twitter.com/deezkits"
            target="_blank"
            rel="noreferrer"
          >
            <TwitterIcon /> twitter
          </a>
        </li>
        <li>
          <a
            href="https://discord.com/invite/deezkits"
            target="_blank"
            rel="noreferrer"
          >
            <DiscordIcon /> discord
          </a>
        </li>
      </ul>
    </footer>
  );
}
