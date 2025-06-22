export default function handler(req: any, res: any) {
  res.status(200).json({
    id: 'test-user-123',
    name: 'Test User',
    email: 'test@example.com'
  });
}
