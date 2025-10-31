# Socially

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel)](https://vercel.com/)

Socially is a **fullstack social media app** that allows users to post content with images, comment on posts, follow other users, and manage notifications. It features **authentication with Prisma and Clerk**, **dark mode**, and a modern, responsive interface. The app is fully deployed on **Vercel**.

---

## 🔗 Demo

Check out the deployed project here:  
[Demo](https://socially-mu-ten.vercel.app/)

---

## 🛠 Technologies Used

- **Framework**: [Next.js 14](https://nextjs.org/)
- **Language**: TypeScript
- **Database**: PostgreSQL + [Prisma](https://www.prisma.io/)
- **Authentication**: [Clerk](https://clerk.com/)
- **Styling**: TailwindCSS, tailwind-merge, tailwindcss-animate
- **UI Components**: Radix UI, Lucide Icons
- **Image Uploads**: UploadThing / @uploadthing/react
- **Themes**: Dark mode with `next-themes`
- **Notifications & Interactions**: Real-time updates with Prisma backend logic
- **State & Utilities**: clsx, class-variance-authority, date-fns, react-hot-toast

---

## ⚡ Features

- **User authentication** with Clerk and Prisma integration.
- **Create posts with images** and rich content.
- **Commenting and liking** functionality for social interactions.
- **Follow system** to connect with other users.
- **Notifications** for likes, comments, and follows.
- **Dark mode** support, switchable by users.
- **Responsive UI** optimized for desktop and mobile.
- **Fullstack architecture** with Next.js API routes and Prisma ORM.
- **Composable UI** with Radix components and TailwindCSS utilities.

---

## ⚙️ CI/CD & Automation

This project includes a full GitHub Actions workflow for continuous integration, testing, and deployment:

- **Continuous Integration (CI)**

  - Runs on `push` or `pull_request` events to `master`.
  - Lints code with **ESLint**.
  - Builds the project.
  - Runs **unit and integration tests** using **Jest**.

- **Continuous Deployment (CD)**

  - Automatic deployment to **Vercel** after CI succeeds.
  - Manual approval required for production deployment.
  - Discord notifications for successful production deployments.

- **Performance & Quality Checks**

  - Weekly **Lighthouse audits** scheduled with GitHub Actions.
  - Dependabot keeps **npm dependencies** and **GitHub Actions** up-to-date weekly.

- **Reusable Workflows**
  - CI tasks are modularized in a **reusable workflow** for maintainability and consistency.
