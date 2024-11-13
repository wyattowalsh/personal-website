import GiscusComments from '@/components/GiscusComments';

// ... other imports ...

const BlogPost = ({ post }) => {
  // ... existing code ...

  return (
    <div>
      {/* ... existing post content ... */}
      <GiscusComments />
    </div>
  );
};

export default BlogPost;
