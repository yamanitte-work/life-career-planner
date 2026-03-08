import type { NextConfig } from "next";

// GitHub Pages (project pages) serves the site under '/<repo-name>'.
// On local dev, basePath should be empty.
const repoName = "life-career-planner";
const isGithubActions = process.env.GITHUB_ACTIONS === "true";
const basePath = isGithubActions ? `/${repoName}` : "";

const nextConfig: NextConfig = {
	output: "export",
	basePath,
	assetPrefix: basePath,
	trailingSlash: true,
	images: {
		unoptimized: true,
	},
};

export default nextConfig;
