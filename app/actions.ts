"use server";

import axios from "axios";
import * as cheerio from "cheerio";
import { headers } from 'next/headers';

export async function getLyrics(songUrl: string, startSection: string, endSection: string) {
  try {
    console.log("Fetching lyrics for", songUrl);
    
    // Get the host from headers
    const headersList = await headers();
    const host = headersList.get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    
    // Construct full URL for the proxy endpoint
    const proxyUrl = `${protocol}://${host}/api/proxy?url=${encodeURIComponent(songUrl)}`;
    console.log("Proxy URL:", proxyUrl);
    
    const { data } = await axios.get(proxyUrl, {
      httpsAgent: undefined,
      proxy: false,
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      }
    });

    console.log(data)

    const $ = cheerio.load(data);

    let lyricsArray = $("div[data-lyrics-container='true']")
      .map((_, el) =>
        $(el)
          .html() // Preserve formatting
          ?.replace(/<br\s*\/?>/g, "\n") // Replace <br> with newlines
          .replace(/<\/p>/g, "\n") // Ensure paragraph breaks
          .replace(/<[^>]*>/g, "") // Remove all other HTML tags
          .trim()
      )
      .get();

    let lyrics = lyricsArray.join("\n\n");

    console.log("Lyrics fetched successfully.");
    console.log("Lyrics length:", lyrics.length);
    console.log("Lyrics:", lyrics);

    // Find the last occurrence of startSection
    const startIndex = lyrics.lastIndexOf(startSection);
    if (startIndex === -1) return "Start section not found.";

    // Find where the lyrics actually start (after startSection)
    const lyricsStart = startIndex + startSection.length;
    
    // Find the endSection after the startSection
    const endIndex = lyrics.indexOf(endSection, lyricsStart);
    if (endIndex === -1) return "End section not found.";

    // Extract lyrics between startSection and endSection (excluding startSection itself)
    const extractedLyrics = lyrics.substring(lyricsStart, endIndex).trim().toUpperCase();

    return extractedLyrics || "Lyrics section not found.";
  } catch (error) {
    console.error("Error fetching lyrics:", error);
    return "Failed to fetch lyrics.";
  }
}
