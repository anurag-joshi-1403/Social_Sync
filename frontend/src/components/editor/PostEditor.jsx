import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { usePosts } from '../../context/PostsContext.jsx';
import ContentOptionCard from './ContentOptionCard.jsx';
import { useAccounts, PLATFORMS } from '../../context/AccountsContext.jsx';

const PostEditor = () => {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      topic: '',
      platform: 'instagram',
      tone: 'casual',
    },
  });
  const navigate = useNavigate();
  const { accounts } = useAccounts();
  const { addPost } = usePosts();

  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [finalCaption, setFinalCaption] = useState('');
  const [finalHashtags, setFinalHashtags] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [scheduleTime, setScheduleTime] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const topicValue = watch('topic');

  // ---------- AI Generation ----------
  const onGenerate = async (data) => {
    setLoading(true);
    setOptions([]);
    setSelectedOption(null);
    setFinalCaption('');
    setFinalHashtags('');
    try {
      const result = await generateContent({
        topic: data.topic,
        platform: data.platform,
        tone: data.tone,
      });
      setOptions(result.options);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (option) => {
    setSelectedOption(option);
    setFinalCaption(option.caption);
    setFinalHashtags(option.hashtags);
  };

  // ---------- Image Upload ----------
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  // ---------- Save Draft ----------
  const handleSaveDraft = () => {
    if (!finalCaption.trim()) {
      showError('Please add caption content before saving.');
      return;
    }
    addPost({
      content: finalCaption,
      hashtags: finalHashtags,
      platform: watch('platform'),
      tone: watch('tone'),
      image: imagePreview,
      status: 'draft',
      scheduledTime: null,
    });
    showSuccess('Draft saved successfully!');
    resetForm();
  };

  // ---------- Schedule Post ----------
  const handleSchedulePost = () => {
    if (!finalCaption.trim()) {
      showError('Please add caption content before scheduling.');
      return;
    }
    if (!scheduleTime) {
      showError('Please choose a date and time for the post.');
      return;
    }
    const scheduledDate = new Date(scheduleTime);
    if (scheduledDate <= new Date()) {
      showError('Please choose a future date and time.');
      return;
    }
    addPost({
      content: finalCaption,
      hashtags: finalHashtags,
      platform: watch('platform'),
      tone: watch('tone'),
      image: imagePreview,
      status: 'scheduled',
      scheduledTime: scheduledDate.toISOString(),
    });
    showSuccess('Post scheduled successfully!');
    resetForm();
    setTimeout(() => navigate('/schedule'), 1200);
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setErrorMsg('');
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  const showError = (msg) => {
    setErrorMsg(msg);
    setSuccessMsg('');
    setTimeout(() => setErrorMsg(''), 3000);
  };

  const resetForm = () => {
    reset();
    setOptions([]);
    setSelectedOption(null);
    setFinalCaption('');
    setFinalHashtags('');
    setImagePreview(null);
    setScheduleTime('');
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h2 className="page-title mb-1">Create Post</h2>
        <p className="page-subtitle mb-0">
          Describe your topic, pick a platform and tone, and let AI draft your content.
        </p>
      </div>

      {/* Warning: no accounts connected */}
      {accounts.length === 0 && (
        <div className="alert alert-warning d-flex align-items-center">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          <div>
            You haven't connected any social accounts yet.{' '}
            <Link to="/accounts" className="alert-link">
              Connect one now
            </Link>{' '}
            to start creating posts.
          </div>
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success d-flex align-items-center">
          <i className="bi bi-check-circle-fill me-2"></i>
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="alert alert-danger d-flex align-items-center">
          <i className="bi bi-exclamation-circle-fill me-2"></i>
          {errorMsg}
        </div>
      )}

      <div className="row g-4">
        {/* Left */}
        <div className="col-lg-8">
          {/* Input Form */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="fw-semibold mb-3">
                <i className="bi bi-magic me-2 text-primary"></i>
                1. Tell AI what you want
              </h5>

              <form onSubmit={handleSubmit(onGenerate)}>
                <div className="mb-3">
                  <label className="form-label">Topic / Keywords</label>
                  <textarea
                    rows="2"
                    className={`form-control ${errors.topic ? 'is-invalid' : ''}`}
                    placeholder="e.g., New coffee shop opening this weekend with cozy ambience"
                    {...register('topic', {
                      required: 'Please enter a topic',
                      minLength: { value: 5, message: 'Topic is too short' },
                    })}
                  />
                  {errors.topic && (
                    <div className="invalid-feedback">{errors.topic.message}</div>
                  )}
                  <small className="text-muted">
                    Tip: Include specific details for better results.
                  </small>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Platform</label>
                    <select
                      className="form-select"
                      {...register('platform')}
                      disabled={accounts.length === 0}
                    >
                      {accounts.length === 0 ? (
                        <option value="">No accounts connected</option>
                      ) : (
                        accounts.map((acc) => {
                          const p = PLATFORMS.find((x) => x.id === acc.platform);
                          return (
                            <option key={acc.platform} value={acc.platform}>
                              {p?.name || acc.platform}
                            </option>
                          );
                        })
                      )}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Tone</label>
                    <select className="form-select" {...register('tone')}>
                      <option value="casual">Casual</option>
                      <option value="professional">Professional</option>
                      <option value="promotional">Promotional</option>
                      <option value="inspirational">Inspirational</option>
                      <option value="humorous">Humorous</option>
                    </select>
                  </div>
                </div>

                <div className="mt-3">
                  <label className="form-label">Attach Image (optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control"
                    onChange={handleImageUpload}
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="preview"
                      className="mt-2 rounded"
                      style={{ maxHeight: '120px' }}
                    />
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary mt-3"
                  disabled={loading || !topicValue || accounts.length === 0}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-stars me-2"></i>
                      Generate Content
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* AI Options */}
          {options.length > 0 && (
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h5 className="fw-semibold mb-3">
                  <i className="bi bi-list-stars me-2 text-primary"></i>
                  2. Pick an AI-generated option
                </h5>
                <div className="row g-3">
                  {options.map((opt) => (
                    <div className="col-md-4" key={opt.id}>
                      <ContentOptionCard
                        option={opt}
                        selected={selectedOption?.id === opt.id}
                        onSelect={handleSelectOption}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Final Editor */}
          {selectedOption && (
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="fw-semibold mb-3">
                  <i className="bi bi-pencil-square me-2 text-primary"></i>
                  3. Refine & schedule
                </h5>

                <div className="mb-3">
                  <label className="form-label">Caption</label>
                  <textarea
                    rows="4"
                    className="form-control"
                    value={finalCaption}
                    onChange={(e) => setFinalCaption(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Hashtags</label>
                  <input
                    type="text"
                    className="form-control"
                    value={finalHashtags}
                    onChange={(e) => setFinalHashtags(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    <i className="bi bi-calendar-event me-1"></i>
                    Schedule Date &amp; Time
                  </label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                  />
                  <small className="text-muted">
                    Choose a future date and time. Required for scheduling.
                  </small>
                </div>

                <div className="d-flex gap-2 flex-wrap">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleSaveDraft}
                  >
                    <i className="bi bi-save me-2"></i>
                    Save as Draft
                  </button>
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={handleSchedulePost}
                  >
                    <i className="bi bi-calendar-plus me-2"></i>
                    Schedule Post
                  </button>
                  <button
                    type="button"
                    className="btn btn-link ms-auto"
                    onClick={resetForm}
                  >
                    Start Over
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Preview */}
        <div className="col-lg-4">
          <div className="card shadow-sm sticky-top" style={{ top: '1rem' }}>
            <div className="card-body">
              <h6 className="fw-semibold mb-3 text-muted text-uppercase small">
                <i className="bi bi-eye me-1"></i>Live Preview
              </h6>
              <div className="preview-card border rounded p-3">
                <div className="d-flex align-items-center mb-3">
                  <div
                    className="user-avatar me-2"
                    style={{ width: 32, height: 32, fontSize: '0.8rem' }}
                  >
                    {(topicValue || 'P').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="fw-semibold small">Your Brand</div>
                    <div className="text-muted small">
                      {scheduleTime
                        ? `Scheduled: ${new Date(scheduleTime).toLocaleString()}`
                        : 'Just now'}
                    </div>
                  </div>
                </div>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="preview"
                    className="img-fluid rounded mb-3"
                  />
                )}
                <p className="small mb-2">
                  {finalCaption || (
                    <span className="text-muted fst-italic">
                      Your caption will appear here...
                    </span>
                  )}
                </p>
                {finalHashtags && (
                  <p className="small text-primary mb-0">{finalHashtags}</p>
                )}
              </div>
              <small className="text-muted d-block mt-3">
                <i className="bi bi-info-circle me-1"></i>
                Preview is approximate. Actual rendering varies by platform.
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostEditor;