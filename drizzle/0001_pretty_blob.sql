CREATE TABLE `candidates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobId` int NOT NULL,
	`model` varchar(128) NOT NULL,
	`imageUrl` text,
	`b2Key` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `candidates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`prompt` text NOT NULL,
	`winnerId` int,
	`consensusScore` int,
	`b2JobPath` varchar(512),
	`manifestHash` varchar(64),
	`status` enum('pending','generating','scoring','storage','complete','failed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`candidateId` int NOT NULL,
	`promptAdherence` int,
	`visualQuality` int,
	`robustness` int,
	`diversity` int,
	`consensusScore` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `scores_id` PRIMARY KEY(`id`)
);
