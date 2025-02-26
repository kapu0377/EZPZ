// 탈퇴회원 관련 데이터 삭제 (체크리스트, 게시글, 댓글)
checklistRepository.deleteByUsername(user.getUsername());
postRepository.deleteByWriter(user.getUsername());  // 게시글 삭제
commentRepository.deleteByWriter(user.getUsername());  // 댓글 삭제
// 토큰 삭제
refreshTokenRepository.deleteByUsername(user.getName());
// 회원 삭제
userRepository.delete(user); 

@Service
@Transactional
public class UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ChecklistRepository checklistRepository;
    @Autowired
    private PostRepository postRepository;
    @Autowired
    private CommentRepository commentRepository;
    @Autowired
    private RefreshTokenRepository refreshTokenRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    public void deleteUser(String username, String password) {
        User user = userRepository.findByUsername(username);
        // 입력된 비밀번호 검증
        if (!passwordEncoder.matches(password, user.getPassword())) {
            return; // 비밀번호 불일치
        }

        try {
            // 탈퇴회원 관련 데이터 삭제 (체크리스트, 게시글, 댓글)
            checklistRepository.deleteByUsername(user.getUsername());
            commentRepository.deleteByWriter(user.getUsername());  // 댓글 먼저 삭제
            postRepository.deleteByWriter(user.getUsername());     // 게시글 삭제
            refreshTokenRepository.deleteByUsername(user.getName());  // 토큰 삭제
            userRepository.delete(user);  // 회원 삭제
            
            System.out.println("회원 탈퇴 완료: " + username);
        } catch (Exception e) {
            System.out.println("회원 탈퇴 중 오류 발생: " + e.getMessage());
            throw new RuntimeException("회원 탈퇴 처리 중 오류가 발생했습니다.");
        }
    }
} 