// block-types.ts
export const Category = {
    red: '#f9015a',
    green: '#11b14c',
    blue: '#1a87ad',
    yellow: '#EAB308',
    purple: '#893fd0',
    gray: '#6B7280',
    orange: '#ea9608',
}

export type Category = keyof typeof Category;

export type ByteSection = {
  name: string;
  group?: string;
  category: Category;
  byteSize: number;
  optional?: boolean;
};


export const routingHeader = [
	{ name: "version", category: "blue", byteSize: 1 },
	{ name: "distance", category: "red", byteSize: 1 },
	{ name: "ttl", category: "green", byteSize: 1 },
	{ name: "flags", category: "yellow", byteSize: 1 },
	{ name: "size_small", category: "yellow", byteSize: 2, optional: true, group: "size" },
	{ name: "size_large", category: "yellow", byteSize: 4, optional: true, group: "size" },

	{ name: "sender_type", category: "purple", byteSize: 1, group: "sender" },
	{ name: "sender_id", category: "purple", byteSize: 18, group: "sender" },
	{ name: "sender_inst", category: "purple", byteSize: 2, group: "sender" },
] as const satisfies ByteSection[];

export const blockHeader: ByteSection[] = [];
export const encryptedHeader: ByteSection[] = [];
export const body: ByteSection[] = [];

type SectionData<T extends string> = {
	[key in T]: {
		field: key,
		bytes: number[],
		parsedData?: string,
	}
}[T][]

export type BlockData = [
	{
		section: "routingHeader",
		parts: SectionData<typeof routingHeader[number]['name']>,
	},
	{ 
		section: "blockHeader",
		parts: SectionData<typeof blockHeader[number]['name']>,
	},
	{ 
		section: "encryptedHeader",
		parts: SectionData<typeof encryptedHeader[number]['name']>,
	},
	{ 
		section: "body",
		parts: SectionData<typeof body[number]['name']>,
	},
]