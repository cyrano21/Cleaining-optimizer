import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PhoenixDocCard from 'components/base/PhoenixDocCard';
import migrations from 'data/migrations';
import { Alert, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Migrations = () => {
  return (
    <div>
      <h2 className="mb-4 lh-sm">Migrations</h2>

      <Card className="mb-4">
        <Card.Body>
          <Alert variant="subtle-warning" className="mb-0">
            <div className="d-flex">
              <FontAwesomeIcon icon={faExclamationTriangle} className="fs-5" />
              <div className="ms-3 flex-1">
                <h4 className="alert-heading">Before you update!</h4>
                Backup your files and read the changelog before updating{' '}
                {process.env.REACT_APP_TITLE}-React on your project. If you come
                across with any problems with {process.env.REACT_APP_TITLE}
                -React template during the update, feel free to contact us at{' '}
                <a href="mailto:support@themewagon.com">
                  support@themewagon.com
                </a>
                .
              </div>
            </div>
          </Alert>
        </Card.Body>
      </Card>

      {migrations.map(migration => (
        <PhoenixDocCard className="mb-4" key={migration.from}>
          <PhoenixDocCard.Header noPreview>
            <div className="d-flex align-items-center">
              <p className="text-body text-nowrap mb-0">
                <code className="fs-7 opacity-50">{migration.from}</code>
                <span className="mx-3">to</span>
                <code className="fs-7">{migration.to}</code>
              </p>
              <Link
                to={`#${migration.to}`}
                className="opacity-0 hover-show fw-bold ps-2"
              >
                #
              </Link>
            </div>
          </PhoenixDocCard.Header>
          <PhoenixDocCard.Body>
            <ul className="bullet-inside ps-0">
              <li>
                <h6 className="d-inline-block">Add</h6>
                <ul>
                  {migration.new.map(file => (
                    <li key={file}>{file}</li>
                  ))}
                </ul>
              </li>
              <li>
                <h6 className="d-inline-block">Modify</h6>
                <ul>
                  {migration.update.map(file => (
                    <li key={file}>{file}</li>
                  ))}
                </ul>
              </li>
              {migration.delete && (
                <li>
                  <h6 className="d-inline-block">Remove</h6>
                  <ul>
                    {migration.delete.map(file => (
                      <li key={file}>{file}</li>
                    ))}
                  </ul>
                </li>
              )}
            </ul>
          </PhoenixDocCard.Body>
        </PhoenixDocCard>
      ))}
    </div>
  );
};

export default Migrations;
