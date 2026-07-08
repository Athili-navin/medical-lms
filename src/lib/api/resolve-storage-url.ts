export async function resolveStorageUrl(
  supabase: {
    storage: {
      from: (bucket: string) => {
        createSignedUrl: (
          path: string,
          expiresIn: number
        ) => Promise<{ data: { signedUrl: string } | null; error: { message: string } | null }>;
      };
    };
  },
  bucket: string,
  path: string,
  expiresIn = 3600
): Promise<string> {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error || !data?.signedUrl) {
    throw new Error(error?.message ?? "Could not resolve file URL");
  }
  return data.signedUrl;
}
