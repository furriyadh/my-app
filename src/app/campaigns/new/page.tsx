import { redirect } from 'next/navigation';

export default function NewCampaignPage() {
  redirect('/dashboard?section=new-campaign');
}
// This code defines a Next.js page that redirects the user to the "new campaign" section of the dashboard.
// It uses the `redirect` function from `next/navigation` to change the URL to `/dashboard?section=new-campaign`.
// This is typically used to guide users to a specific part of the application, in this case to create a new campaign in the dashboard.