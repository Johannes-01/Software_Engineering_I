# Onboarding Document

Notice: this is a mock project for the university to show the workflow in modern software engineering. This website does not fulfil any legal requirements for websites, as these do not have to be fulfilled for educational purposes.

Please read this document carefully before creating any pull requests for this repo. As it conveys the infrastructure decisions and engineering principles for this project.

## Prerequisites

- NodeJS v20
- npm
- Git
- we recommend VSCode
- DockerDesktop (for Supabase)

## Getting Started

```bash
# Clone the repository 
git clone https://github.com/johannes-01/software_Engineering_I

# Install dependencies
npm run install

# Docker needs to be running
# Initialize supabase 
npm run supabase

# Seed images
npm run seed-images

# Start web app
npm run dev

# Run test
npm run test
```

## Engineering Principles

As a contributor to this repository, I adhere to these guidelines to the best of my knowledge and belief.

### Locality of Behavior

I avoid abstraction behind methods or files and always write code where it's actually used.

### Write Everything Twice (WET)

I don't aggressively aim for DRY (Don't Repeat Yourself) code, but instead view duplication as an important tool to avoid wrong abstractions.

### Don't Repeat Yourself (DRY)

I don't repeat the same representation of data/logic. I keep in mind that accidental duplication exists and stick to the WET rule when I'm not certain whether it's truly the same data/logic. 
 
### Easy to Change (ETC)

I maintain the supreme principle that code should be easy to edit, delete, and extend. I question whether my changes continue to fulfill the ETC principle.

### Inheritance Levels

When using inheritance, I ensure it remains shallow rather than deep. Inheritance should never be more than one level deep.

### Keep It Simple, Stupid (KISS)

I always try to write the simplest possible code. Even when there are cool/clever solutions to a problem, I keep in focus that it should be easily understandable and readable. 

### No Silver Bullet

I'm aware that no guidelines are the holy grail, and I must always evaluate what's the best solution for each specific case during development. When I'm stuck, I rely on the collective intelligence of the team.

## Project Struture

This project is a approuter next.js webapp. Therefore has this project a predetermined structure. If you are not familiar with the project structure checkout the [NextJs Documentation](https://nextjs.org/docs)

# Development Workflow

## Branching Strategy

This repository uses a GitLab Flow branching strategy to manage code development and releases. Here's a brief overview of the process:

![GitLab Flow](GitLabFlow.webp) 

### Main Branch

- Represent the working state. It is the basis for a release.
- The main branch should always be in a deployable state.
- The main branch is protected from direct pushes.
- All features must be merged through merge requests from Feature branches. 

### Pre Production

- Integration branch before production
- Used for final testing and validation
- The pre production branch automatically deployes to preview environment
- Receives merges from ``main``
  
### Production

- Reflects what's currently deployed to production
- Tagged with release versions
- The production branch deployes to production environment via release from tag
- The production branch is a protected branch with strict access controls
- Receives merges from ``pre production``

## Contribution Guide

### Commit Guideline

A commit should have the following format {type}(#{ticket_id}) {message}.

```bash
git commit -m "fix(#123) adjust files for task XYZ"
```

|Type|Description|
|------|-------------|
|feature|Adding new functionality to the application| 
|fix|Fixing an issue| 
|refactor|Refactor parts of the code|  

## Versions with tags

A tag should have the following format.

### major.minor.patch

- Major version is increases if there are **incompatible changes** in the API or the behaviour of the software
- Minor version is increased when **new functions** are added that are downward compatible.
- Patch version is increased when **bugs are fixed** or small, backwards-compatible changes are made.

### create tag

```bash
git tag "v1.0.0"
```

# Technology Stack

![img.png](img.png)

## Frontend / BFF Architecture

NextJS was chosen for the frontend. This means that there is a React frontend and a NodeJS BFF. The microservices for the individual requests can be logically connected with NodeJS.

## Backend (Microservices Architektur)

A microservice architecture is used for the backend, which consists of a PostgreSQL database, a authentication server and an S3 blob storage that is provided via Supabase

## deployment

The deployment of the Website is possible through Vercel.
