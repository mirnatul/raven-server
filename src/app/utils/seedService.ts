import { prisma } from "../lib/prisma";

export const seedServices = async () => {
	try {
		const isServiceExist = await prisma.service.findFirst();

		if (isServiceExist) {
			return;
		}

		const services = [
			{
				name: "Web Development",
				description:
					"Modern and scalable websites and web applications for businesses and startups.",
				imageUrl: "https://...",
				technologies: ["Next.js", "React", "Node.js", "PostgreSQL"],
			},
			{
				name: "App Development",
				description:
					"High-quality mobile applications designed for smooth and engaging user experiences.",
				imageUrl: "https://...",
				technologies: ["React Native", "Flutter", "Node.js", "Firebase"],
			},
			{
				name: "AI Integration",
				description:
					"Add intelligent AI-powered features and automation to your products and workflows.",
				imageUrl: "https://...",
				technologies: ["OpenAI", "LangChain", "Python", "Node.js"],
			},
			{
				name: "UI/UX Design",
				description:
					"Beautiful and intuitive digital experiences designed around your users and goals.",
				imageUrl: "https://...",
				technologies: ["Figma", "FigJam", "Adobe XD"],
			},
			{
				name: "Video Editing",
				description:
					"Professional video editing for social media, marketing, products, and brands.",
				imageUrl: "https://...",
				technologies: ["Premiere Pro", "After Effects", "DaVinci Resolve"],
			},
			{
				name: "Digital Marketing",
				description:
					"Data-driven digital marketing strategies to grow your brand and reach more customers.",
				imageUrl: "https://...",
				technologies: ["Google Ads", "Meta Ads", "Analytics", "SEO"],
			},
		];

		await prisma.service.createMany({
			data: services,
		});

		console.log("Services seeded successfully");
	} catch (error) {
		console.log("Error seeding services:", error);
	}
};
